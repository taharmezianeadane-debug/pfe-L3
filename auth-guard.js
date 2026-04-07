(function () {
    const DEFAULT_TIMEOUT_MS = 5000;

    function createError(message, status, code) {
        const error = new Error(message);
        error.status = status || 0;
        error.code = code || 'error';
        return error;
    }

    function getApiUrl(action, params) {
        if (window.location.protocol === 'file:') {
            throw createError(
                `Ouvrez cette page via WAMP: http://localhost/pfe-L3-taher/pfe-L3-main/${window.location.pathname.split('/').pop()}`,
                0,
                'file_protocol'
            );
        }

        const url = new URL('api.php', window.location.href);
        url.searchParams.set('action', action);

        Object.entries(params || {}).forEach(function ([key, value]) {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, String(value));
            }
        });

        return url.toString();
    }

    async function requestJson(action, options, params, timeoutMs) {
        const controller = new AbortController();
        const effectiveTimeout = timeoutMs || DEFAULT_TIMEOUT_MS;
        const requestOptions = Object.assign({}, options || {}, { signal: controller.signal });
        const timer = setTimeout(function () {
            controller.abort();
        }, effectiveTimeout);

        let url = '';

        try {
            url = getApiUrl(action, params);
            const response = await fetch(url, requestOptions);
            const text = await response.text();
            let data = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (error) {
                    throw createError('Reponse invalide du serveur.', response.status, 'invalid_json');
                }
            }

            if (!response.ok) {
                throw createError(data.message || `Erreur HTTP ${response.status}`, response.status, 'http');
            }

            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw createError('Impossible de verifier votre session pour le moment.', 0, 'timeout');
            }

            if (error.code) {
                throw error;
            }

            throw createError(error.message || 'Impossible de verifier votre session pour le moment.', 0, 'network');
        } finally {
            clearTimeout(timer);
        }
    }

    async function resolveProfile(timeoutMs) {
        try {
            const data = await requestJson('get_profile', {}, {}, timeoutMs);
            return { kind: 'profile', profile: data.profile || null };
        } catch (error) {
            if (error.status === 401) {
                return { kind: 'guest' };
            }

            return { kind: 'error', error: error };
        }
    }

    function defaultHomeForRole(role) {
        return role === 'employeur' ? 'candidats.html' : 'offres.html';
    }

    function setHidden(elements, hidden) {
        (elements || []).forEach(function (element) {
            if (element) {
                element.hidden = hidden;
            }
        });
    }

    function renderFallback(container, state, config) {
        if (!container) {
            return;
        }

        if (state === 'loading') {
            container.hidden = false;
            container.innerHTML = [
                '<div class="guard-card">',
                '  <div class="guard-spinner" aria-hidden="true"></div>',
                '  <h1>Verification en cours</h1>',
                '  <p>Nous verifions votre session avant d afficher cette page.</p>',
                '</div>'
            ].join('');
            return;
        }

        if (state === 'error') {
            container.hidden = false;
            container.innerHTML = [
                '<div class="guard-card">',
                '  <div class="guard-icon"><i class="fas fa-triangle-exclamation"></i></div>',
                '  <h1>Impossible de verifier votre session</h1>',
                '  <p>Impossible de verifier votre session pour le moment.</p>',
                '  <div class="guard-actions">',
                '    <button type="button" class="guard-btn guard-btn-primary" id="guardRetryButton">Reessayer</button>',
                '    <a href="index.html" class="guard-btn guard-btn-secondary">Accueil</a>',
                '  </div>',
                '</div>'
            ].join('');

            const retryButton = container.querySelector('#guardRetryButton');
            if (retryButton && config && typeof config.onRetry === 'function') {
                retryButton.addEventListener('click', config.onRetry);
            }
        }
    }

    async function logoutAndRedirect(redirectTo) {
        try {
            await requestJson('logout');
        } catch (error) {
        }

        window.location.replace(redirectTo || 'connexion.html');
    }

    function bindSessionAction(element, profile, redirectTo) {
        if (!element) {
            return;
        }

        if (profile) {
            element.textContent = 'Deconnexion';
            element.href = 'connexion.html';
            element.onclick = function (event) {
                event.preventDefault();
                logoutAndRedirect(redirectTo || 'connexion.html');
            };
            return;
        }

        element.textContent = 'Connexion';
        element.href = 'connexion.html';
        element.onclick = null;
    }

    async function guardPage(config) {
        const guardedElements = (config.guarded || []).map(function (entry) {
            return typeof entry === 'string' ? document.getElementById(entry) : entry;
        }).filter(Boolean);
        const fallbackElement = typeof config.fallback === 'string'
            ? document.getElementById(config.fallback)
            : config.fallback;

        setHidden(guardedElements, true);
        renderFallback(fallbackElement, 'loading');

        const session = await resolveProfile(config.timeoutMs || DEFAULT_TIMEOUT_MS);

        if (session.kind === 'error') {
            renderFallback(fallbackElement, 'error', {
                onRetry: function () {
                    guardPage(config);
                }
            });
            return { state: 'error', error: session.error };
        }

        const profile = session.kind === 'profile' ? session.profile : null;

        if (!profile) {
            if (!config.allowGuest) {
                window.location.replace(config.redirectGuestTo || 'connexion.html');
                return { state: 'redirect' };
            }

            try {
                if (typeof config.onAuthorized === 'function') {
                    await config.onAuthorized(null);
                }
            } catch (error) {
                renderFallback(fallbackElement, 'error', {
                    onRetry: function () {
                        guardPage(config);
                    }
                });
                return { state: 'error', error: error };
            }

            if (fallbackElement) {
                fallbackElement.hidden = true;
            }

            setHidden(guardedElements, false);
            return { state: 'authorized', profile: null };
        }

        if (config.redirectByRole && config.redirectByRole[profile.role]) {
            window.location.replace(config.redirectByRole[profile.role]);
            return { state: 'redirect', profile: profile };
        }

        if (Array.isArray(config.allowedRoles) && config.allowedRoles.length && !config.allowedRoles.includes(profile.role)) {
            window.location.replace(defaultHomeForRole(profile.role));
            return { state: 'redirect', profile: profile };
        }

        try {
            if (typeof config.onAuthorized === 'function') {
                await config.onAuthorized(profile);
            }
        } catch (error) {
            renderFallback(fallbackElement, 'error', {
                onRetry: function () {
                    guardPage(config);
                }
            });
            return { state: 'error', error: error };
        }

        if (fallbackElement) {
            fallbackElement.hidden = true;
        }

        setHidden(guardedElements, false);
        return { state: 'authorized', profile: profile };
    }

    window.CareerPropulseAuth = {
        DEFAULT_TIMEOUT_MS: DEFAULT_TIMEOUT_MS,
        bindSessionAction: bindSessionAction,
        defaultHomeForRole: defaultHomeForRole,
        getApiUrl: getApiUrl,
        guardPage: guardPage,
        logoutAndRedirect: logoutAndRedirect,
        requestJson: requestJson,
        resolveProfile: resolveProfile
    };
})();
