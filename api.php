<?php
header('Content-Type: application/json');
<<<<<<< HEAD
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
=======
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
>>>>>>> ca0e8c04de280631265df0e99a1c462b2e1a3d54

session_start();

include 'config.php';

<<<<<<< HEAD
// ========================================
// SÉCURITÉ: CSRF TOKEN & SANITISATION
// ========================================

/**
 * Génère et retourne le token CSRF
 */
function getCsrfToken(): string {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Valide le token CSRF
 */
function validateCsrfToken(): bool {
    // Les GET ne nécessitent pas de validation CSRF
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        return true;
    }
    
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_REQUEST['_csrf_token'] ?? null;
    
    if (!$token || !isset($_SESSION['csrf_token'])) {
        return false;
    }
    
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Échappe et valide les chaînes
 */
function sanitize(string $input, string $type = 'string'): ?string {
    $input = trim($input);
    
    if (empty($input) && $type !== 'optional') {
        return null;
    }
    
    switch ($type) {
        case 'email':
            return filter_var($input, FILTER_SANITIZE_EMAIL);
        case 'integer':
            return filter_var($input, FILTER_SANITIZE_NUMBER_INT);
        case 'url':
            return filter_var($input, FILTER_SANITIZE_URL);
        case 'string':
        default:
            return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    }
}

/**
 * Valide les entrées
 */
function validateInput(string $input, string $type = 'string'): bool {
    switch ($type) {
        case 'email':
            return filter_var($input, FILTER_VALIDATE_EMAIL) !== false;
        case 'password':
            return strlen($input) >= 6;
        case 'integer':
            return filter_var($input, FILTER_VALIDATE_INT) !== false;
        default:
            return !empty($input);
    }
}

function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function getJsonInput(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function encodeJsonField($value): ?string
{
    if ($value === null || $value === '') {
        return null;
    }

    return json_encode($value, JSON_UNESCAPED_UNICODE);
}

function decodeJsonField($value): array
{
    if (!$value) {
        return [];
    }

    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : [];
}

function requireAuth(): void
{
    if (!isset($_SESSION['user_id'], $_SESSION['role'])) {
        respond(401, ['success' => false, 'message' => 'Non authentifie']);
    }
}

function requireRole(string $role): void
{
    requireAuth();

    if ($_SESSION['role'] !== $role) {
        respond(403, ['success' => false, 'message' => 'Acces interdit']);
    }
}

function formatEmployeeCv(array $profile, bool $includeSensitiveFields = true): array
{
    $profile['skills'] = decodeJsonField($profile['skills_json'] ?? null);
    $profile['languages'] = decodeJsonField($profile['languages_json'] ?? null);
    $profile['experiences'] = decodeJsonField($profile['experiences_json'] ?? null);
    $profile['formations'] = decodeJsonField($profile['formations_json'] ?? null);
    $profile['certificates'] = decodeJsonField($profile['certificates_json'] ?? null);

    unset(
        $profile['skills_json'],
        $profile['languages_json'],
        $profile['experiences_json'],
        $profile['formations_json'],
        $profile['certificates_json']
    );

    if (!$includeSensitiveFields) {
        unset(
            $profile['email'],
            $profile['telephone'],
            $profile['created_at'],
            $profile['updated_at']
        );
    }

    return $profile;
}

function formatCandidatePreview(array $profile): array
{
    $formatted = formatEmployeeCv($profile, false);

    return [
        'id' => $formatted['id'],
        'prenom' => $formatted['prenom'] ?? '',
        'nom' => $formatted['nom'] ?? '',
        'profile_picture' => $formatted['profile_picture'] ?? '',
        'address' => $formatted['address'] ?? '',
        'titre' => $formatted['titre'] ?? '',
        'cv_summary' => $formatted['cv_summary'] ?? '',
        'skills' => $formatted['skills'] ?? [],
        'languages' => $formatted['languages'] ?? [],
        'certificates' => $formatted['certificates'] ?? []
    ];
}

function getDiplomeLevels(): array
{
    return [
        'bac' => 1,
        'bac+2' => 2,
        'bac+3' => 3,
        'bac+4' => 4,
        'bac+5' => 5,
        'doctorat' => 6,
    ];
}

function getCandidateHighestDiploma(array $formations): string
{
    $diplomeLevels = getDiplomeLevels();
    $highestDiploma = '';
    $highestLevel = 0;

    foreach ($formations as $formation) {
        $level = $diplomeLevels[$formation['diplome'] ?? ''] ?? 0;
        if ($level > $highestLevel) {
            $highestLevel = $level;
            $highestDiploma = $formation['diplome'] ?? '';
        }
    }

    return $highestDiploma;
}

function offerMatchesCandidate(array $offer, array $candidateSkills, array $candidateLanguages, string $candidateDiplome): bool
{
    $diplomeLevels = getDiplomeLevels();

    // Vérifier les compétences requises
    if (!empty($offer['competences_requises'])) {
        $requiredSkills = array_filter(array_map('trim', explode(',', $offer['competences_requises'])));
        foreach ($requiredSkills as $skill) {
            if (!in_array(trim($skill), $candidateSkills, true)) {
                return false;
            }
        }
    }

    // Vérifier les langues requises
    if (!empty($offer['langues_requises'])) {
        $requiredLanguages = array_filter(array_map('trim', explode(',', $offer['langues_requises'])));
        foreach ($requiredLanguages as $lang) {
            if (!in_array(trim($lang), $candidateLanguages, true)) {
                return false;
            }
        }
    }

    // Vérifier le diplôme requis
    if (!empty($offer['diplome_requis'])) {
        $requiredLevel = $diplomeLevels[$offer['diplome_requis']] ?? 0;
        $candidateLevel = $diplomeLevels[$candidateDiplome] ?? 0;
        if ($candidateLevel < $requiredLevel) {
            return false;
        }
    }

    return true;
}

$action = $_GET['action'] ?? '';

// ========================================
// ACTION: get_csrf_token - Pas d'authentification nécessaire
// ========================================
if ($action === 'get_csrf_token') {
    respond(200, [
        'success' => true,
        'csrf_token' => getCsrfToken()
    ]);
}

// Valider le CSRF token pour les actions autres que login/register/get_csrf_token
if (!in_array($action, ['login', 'register', 'get_csrf_token', 'logout'], true)) {
    if (!validateCsrfToken()) {
        respond(403, ['success' => false, 'message' => 'Token CSRF invalide']);
    }
}

if ($action === 'register') {
    $data = getJsonInput();
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'employe';
    $name = trim($data['name'] ?? '');
    $company = trim($data['company'] ?? '');

    if (!$email || !$password) {
        respond(400, ['success' => false, 'message' => 'Email et mot de passe requis']);
    }

    try {
        $hashedPwd = password_hash($password, PASSWORD_BCRYPT);

        if ($role === 'employeur') {
            $stmt = $pdo->prepare(
                "INSERT INTO `cv-employeur` (mail, password, nom_company, nom, poste, secteur, taille, localisation, profile_summary)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([
                $email,
                $hashedPwd,
                $company,
                $name,
                trim($data['poste'] ?? ''),
                trim($data['secteur'] ?? ''),
                trim($data['taille'] ?? ''),
                trim($data['localisation'] ?? ''),
                trim($data['profile_summary'] ?? '')
            ]);
        } else {
            $prenom = trim($data['prenom'] ?? '');
            $nom = trim($data['nom'] ?? $name);
            $langues = $data['languages'] ?? [];
            $competences = $data['skills'] ?? [];
            $diplome = trim($data['diplome'] ?? '');
            $qualites = $data['qualites'] ?? [];

            $stmt = $pdo->prepare(
                "INSERT INTO `cv-employe` (email, password, prenom, nom, telephone, titre_profil, description, competences, langues, diplome, qualites, domaine)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([
                $email,
                $hashedPwd,
                $prenom,
                $nom,
                trim($data['telephone'] ?? ''),
                trim($data['titre'] ?? ''),
                trim($data['cv_summary'] ?? ''),
                implode(', ', $competences),
                implode(', ', $langues),
                $diplome,
                implode(', ', $qualites),
                'frontend' // domaine par défaut
            ]);
        }

        respond(200, ['success' => true, 'message' => 'Inscription reussie']);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            respond(200, ['success' => false, 'message' => 'Cet email existe deja']);
        }

        respond(500, [
            'success' => false,
            'message' => 'Erreur base de donnees pendant l inscription',
            'error' => $e->getMessage()
        ]);
    }
}

if ($action === 'login') {
    $data = getJsonInput();
    $email = trim($data['email'] ?? '');
=======
$action = $_GET['action'] ?? '';

// INSCRIPTION
if ($action === 'register') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'employe';
    $name = $data['name'] ?? '';
    $company = $data['company'] ?? '';

    if (!$email || !$password) {
        echo json_encode(['success' => false, 'message' => 'Email et mot de passe requis']);
        exit;
    }

    try {
        $hashed_pwd = password_hash($password, PASSWORD_BCRYPT);

        if ($role === 'employeur') {
            // Insérer dans cv-employeur
            $stmt = $pdo->prepare("INSERT INTO `cv-employeur` (mail, password, nom_company, nom) VALUES (?, ?, ?, ?)");
            $stmt->execute([$email, $hashed_pwd, $company, $name]);
        } else {
            // Insérer dans employees
            $prenom = isset($data['prenom']) ? $data['prenom'] : '';
            $nom = isset($data['nom']) ? $data['nom'] : $name;
            $stmt = $pdo->prepare("INSERT INTO employees (email, password, prenom, nom) VALUES (?, ?, ?, ?)");
            $stmt->execute([$email, $hashed_pwd, $prenom, $nom]);
        }

        echo json_encode(['success' => true, 'message' => 'Inscription réussie']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Cet email existe déjà']);
    }
    exit;
}

// CONNEXION
if ($action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
>>>>>>> ca0e8c04de280631265df0e99a1c462b2e1a3d54
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'employe';

    if (!$email || !$password) {
<<<<<<< HEAD
        respond(400, ['success' => false, 'message' => 'Email et mot de passe requis']);
=======
        echo json_encode(['success' => false, 'message' => 'Email et mot de passe requis']);
        exit;
>>>>>>> ca0e8c04de280631265df0e99a1c462b2e1a3d54
    }

    if ($role === 'employeur') {
        $stmt = $pdo->prepare("SELECT * FROM `cv-employeur` WHERE mail = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['mail'];
            $_SESSION['email'] = $user['mail'];
            $_SESSION['role'] = 'employeur';
<<<<<<< HEAD
            respond(200, ['success' => true, 'message' => 'Connexion reussie', 'role' => 'employeur']);
        }

        respond(200, ['success' => false, 'message' => 'Email ou mot de passe incorrect']);
    }

    $stmt = $pdo->prepare("SELECT * FROM `cv-employe` WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = 'employe';
        respond(200, ['success' => true, 'message' => 'Connexion reussie', 'role' => 'employe']);
    }

    respond(200, ['success' => false, 'message' => 'Email ou mot de passe incorrect']);
}

if ($action === 'logout') {
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }

    session_destroy();
    respond(200, ['success' => true, 'message' => 'Deconnexion reussie']);
}

if ($action === 'get_profile') {
    requireAuth();

    try {
        if ($_SESSION['role'] === 'employeur') {
            $stmt = $pdo->prepare(
                "SELECT mail AS email, nom, nom_company, profile_picture, poste, secteur, taille, localisation, profile_summary, created_at, updated_at
                 FROM `cv-employeur`
                 WHERE mail = ?"
            );
            $stmt->execute([$_SESSION['user_id']]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$profile) {
                respond(404, ['success' => false, 'message' => 'Profil introuvable']);
            }

            $offersStmt = $pdo->prepare(
                "SELECT id, title, description, location, created_at, updated_at
                 FROM job_offers
                 WHERE employer_id = ?
                 ORDER BY created_at DESC"
            );
            $offersStmt->execute([$_SESSION['user_id']]);
            $profile['offers'] = $offersStmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $stmt = $pdo->prepare(
                "SELECT id, email, prenom, nom, telephone, titre_profil, description, competences, langues, diplome, qualites, domaine, profile_picture, created_at, updated_at
                 FROM `cv-employe`
                 WHERE id = ?"
            );
            $stmt->execute([$_SESSION['user_id']]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$profile) {
                respond(404, ['success' => false, 'message' => 'Profil introuvable']);
            }

            // Formater les données pour correspondre à l'ancien format
            $profile['titre'] = $profile['titre_profil'];
            $profile['cv_summary'] = $profile['description'];
            $profile['skills'] = $profile['competences'] ? explode(', ', $profile['competences']) : [];
            $profile['languages'] = $profile['langues'] ? explode(', ', $profile['langues']) : [];
            $profile['qualities'] = $profile['qualites'] ? explode(', ', $profile['qualites']) : [];

            unset($profile['titre_profil'], $profile['description'], $profile['competences'], $profile['langues'], $profile['qualites']);
        }

        $profile['role'] = $_SESSION['role'];
        respond(200, ['success' => true, 'profile' => $profile]);
    } catch (PDOException $e) {
        respond(500, [
            'success' => false,
            'message' => 'Erreur base de donnees pendant la lecture du profil',
            'error' => $e->getMessage()
        ]);
    }
}

if ($action === 'get_candidates') {
    requireRole('employeur');

    try {
        $stmt = $pdo->query(
            "SELECT id, prenom, nom, profile_picture, address, titre, cv_summary, skills_json, languages_json, experiences_json, formations_json, certificates_json, updated_at, created_at
             FROM employees
             ORDER BY updated_at DESC, created_at DESC"
        );

        $candidates = array_map('formatCandidatePreview', $stmt->fetchAll(PDO::FETCH_ASSOC));
        respond(200, ['success' => true, 'candidates' => $candidates]);
    } catch (PDOException $e) {
        respond(500, [
            'success' => false,
            'message' => 'Erreur base de donnees pendant la lecture des candidats',
            'error' => $e->getMessage()
        ]);
    }
}

if ($action === 'get_candidate_profile') {
    requireRole('employeur');

    $candidateId = filter_input(INPUT_GET, 'candidate_id', FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1]
    ]);

    if (!$candidateId) {
        respond(404, ['success' => false, 'message' => 'Candidat introuvable']);
    }

    try {
        $stmt = $pdo->prepare(
            "SELECT id, prenom, nom, email, telephone, titre_profil, description, competences, langues, diplome, created_at
             FROM `cv-employe`
             WHERE id = ?"
        );
        $stmt->execute([$candidateId]);
        $candidate = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$candidate) {
            respond(404, ['success' => false, 'message' => 'Candidat introuvable']);
        }

        respond(200, [
            'success' => true,
            'candidate' => $candidate
        ]);
    } catch (PDOException $e) {
        respond(500, [
            'success' => false,
            'message' => 'Erreur base de donnees pendant la lecture du candidat',
            'error' => $e->getMessage()
        ]);
    }
}

if ($action === 'update_profile') {
    requireAuth();

    $data = getJsonInput();

    try {
        if ($_SESSION['role'] === 'employeur') {
            $stmt = $pdo->prepare(
                "UPDATE `cv-employeur`
                 SET nom = ?, nom_company = ?, profile_picture = ?, poste = ?, secteur = ?, taille = ?, localisation = ?, profile_summary = ?
                 WHERE mail = ?"
            );
            $stmt->execute([
                trim($data['nom'] ?? ''),
                trim($data['nom_company'] ?? ''),
                trim($data['profile_picture'] ?? '') ?: null,
                trim($data['poste'] ?? ''),
                trim($data['secteur'] ?? ''),
                trim($data['taille'] ?? ''),
                trim($data['localisation'] ?? ''),
                trim($data['profile_summary'] ?? ''),
                $_SESSION['user_id']
            ]);
        } else {
            $stmt = $pdo->prepare(
                "UPDATE employees
                 SET prenom = ?, nom = ?, profile_picture = ?, telephone = ?, address = ?, titre = ?, cv_summary = ?, skills_json = ?, languages_json = ?, experiences_json = ?, formations_json = ?, certificates_json = ?
                 WHERE id = ?"
            );
            $stmt->execute([
                trim($data['prenom'] ?? ''),
                trim($data['nom'] ?? ''),
                trim($data['profile_picture'] ?? '') ?: null,
                trim($data['telephone'] ?? ''),
                trim($data['address'] ?? ''),
                trim($data['titre'] ?? ''),
                trim($data['cv_summary'] ?? ''),
                encodeJsonField($data['skills'] ?? []),
                encodeJsonField($data['languages'] ?? []),
                encodeJsonField($data['experiences'] ?? []),
                encodeJsonField($data['formations'] ?? []),
                encodeJsonField($data['certificates'] ?? []),
                $_SESSION['user_id']
            ]);
        }

        respond(200, ['success' => true, 'message' => 'Profil mis a jour']);
    } catch (PDOException $e) {
        respond(500, [
            'success' => false,
            'message' => 'Erreur base de donnees pendant la mise a jour du profil',
            'error' => $e->getMessage()
        ]);
    }
}

if ($action === 'add_offer') {
    requireAuth();

    if ($_SESSION['role'] !== 'employeur') {
        respond(403, ['success' => false, 'message' => 'Seuls les employeurs peuvent publier des offres']);
    }

    $data = getJsonInput();
    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $location = trim($data['location'] ?? '');
    $domaine = trim($data['domaine'] ?? '');
    $competencesRequises = $data['competences_requises'] ?? [];
    $languesRequises = $data['langues_requises'] ?? [];
    $diplomeRequis = trim($data['diplome_requis'] ?? '');

    if (!$title) {
        respond(400, ['success' => false, 'message' => 'Titre requis']);
    }

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO job_offers (employer_id, title, description, location, domaine, competences_requises, langues_requises, diplome_requis)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $_SESSION['user_id'],
            $title,
            $description,
            $location,
            $domaine,
            implode(', ', $competencesRequises),
            implode(', ', $languesRequises),
            $diplomeRequis
        ]);
        respond(200, ['success' => true, 'message' => 'Offre ajoutee']);
    } catch (PDOException $e) {
        respond(500, [
            'success' => false,
            'message' => 'Erreur base de donnees pendant l ajout de l offre',
            'error' => $e->getMessage()
        ]);
    }
}

if ($action === 'get_offers') {
    try {
        $stmt = $pdo->query(
            "SELECT o.*, c.company as company_name
             FROM job_offers o
             JOIN `cv-employeur` c ON o.employer_id = c.id
             ORDER BY o.created_at DESC"
        );
        $allOffers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (isset($_SESSION['role']) && $_SESSION['role'] === 'employe') {
            $candidateStmt = $pdo->prepare(
                "SELECT competences, langues, diplome FROM `cv-employe` WHERE id = ?"
            );
            $candidateStmt->execute([$_SESSION['user_id']]);
            $candidate = $candidateStmt->fetch(PDO::FETCH_ASSOC);

            if ($candidate) {
                $candidateSkills = array_filter(array_map('trim', explode(',', $candidate['competences'] ?? '')));
                $candidateLanguages = array_filter(array_map('trim', explode(',', $candidate['langues'] ?? '')));
                $candidateDiplome = $candidate['diplome'] ?? '';

                $matchedOffers = [];
                foreach ($allOffers as $offer) {
                    if (offerMatchesCandidate($offer, $candidateSkills, $candidateLanguages, $candidateDiplome)) {
                        $matchedOffers[] = $offer;
                    }
                }

                respond(200, ['success' => true, 'offers' => $matchedOffers]);
                return;
            }
        }

        respond(200, ['success' => true, 'offers' => $allOffers]);
    } catch (PDOException $e) {
        respond(500, [
            'success' => false,
            'message' => 'Erreur lors de la récupération des offres',
            'error' => $e->getMessage()
        ]);
    }
}

if ($action === 'apply_to_offer') {
    requireAuth();

    if ($_SESSION['role'] !== 'employe') {
        respond(403, ['success' => false, 'message' => 'Seuls les employés peuvent postuler']);
    }

    $input = getJsonInput();
    $offerId = $input['offer_id'] ?? null;

    if (!$offerId) {
        respond(400, ['success' => false, 'message' => 'ID de l\'offre requis']);
    }

    try {
        // Vérifier si l'offre existe
        $stmt = $pdo->prepare('SELECT id FROM job_offers WHERE id = ?');
        $stmt->execute([$offerId]);
        if (!$stmt->fetch()) {
            respond(404, ['success' => false, 'message' => 'Offre non trouvée']);
        }

        // Vérifier si déjà postulé
        $stmt = $pdo->prepare('SELECT id FROM applications WHERE offer_id = ? AND candidate_id = ?');
        $stmt->execute([$offerId, $_SESSION['user_id']]);
        if ($stmt->fetch()) {
            respond(400, ['success' => false, 'message' => 'Vous avez déjà postulé à cette offre']);
        }

        // Insérer la candidature
        $stmt = $pdo->prepare('INSERT INTO applications (offer_id, candidate_id, status, applied_at) VALUES (?, ?, \'pending\', NOW())');
        $stmt->execute([$offerId, $_SESSION['user_id']]);

        respond(200, ['success' => true, 'message' => 'Candidature envoyée avec succès']);
    } catch (Exception $e) {
        respond(500, [
            'success' => false,
            'message' => 'Erreur lors de la candidature',
            'error' => $e->getMessage()
        ]);
    }
}

if ($action === 'get_applications') {
    requireAuth();

    if ($_SESSION['role'] !== 'employeur') {
        respond(403, ['success' => false, 'message' => 'Seuls les employeurs peuvent voir les candidatures']);
    }

    try {
        $stmt = $pdo->prepare('
            SELECT a.*, jo.title, jo.description, jo.location, e.prenom, e.nom, e.email, e.telephone AS phone, e.address AS candidate_location
            FROM applications a
            JOIN job_offers jo ON a.offer_id = jo.id
            JOIN employees e ON a.candidate_id = e.id
            WHERE jo.employer_id = ?
            ORDER BY a.applied_at DESC
        ');
        $stmt->execute([$_SESSION['user_id']]);
        $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

        respond(200, [
            'success' => true,
            'applications' => $applications
        ]);
    } catch (Exception $e) {
        respond(500, [
            'success' => false,
            'message' => 'Erreur lors de la récupération des candidatures',
            'error' => $e->getMessage()
        ]);
    }
}

if ($action === 'update_application_status') {
    requireRole('employeur');

    $data = getJsonInput();
    $applicationId = intval($data['application_id'] ?? 0);
    $status = trim(strtolower($data['status'] ?? ''));

    if (!$applicationId || !in_array($status, ['accepted', 'rejected'], true)) {
        respond(400, ['success' => false, 'message' => 'Informations de statut invalides']);
    }

    try {
        $stmt = $pdo->prepare(
            'SELECT a.*, jo.title as offer_title, jo.location as offer_location, e.email, e.prenom, e.nom
            FROM applications a
            JOIN job_offers jo ON a.offer_id = jo.id
            JOIN employees e ON a.candidate_id = e.id
            WHERE a.id = ? AND jo.employer_id = ?'
        );
        $stmt->execute([$applicationId, $_SESSION['user_id']]);
        $application = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$application) {
            respond(404, ['success' => false, 'message' => 'Candidature introuvable']);
        }

        if ($application['status'] === $status) {
            respond(200, ['success' => true, 'message' => 'Statut deja defini']);
        }

        $updateStmt = $pdo->prepare('UPDATE applications SET status = ? WHERE id = ?');
        $updateStmt->execute([$status, $applicationId]);

        $candidateName = trim(($application['prenom'] ?? '') . ' ' . ($application['nom'] ?? ''));
        $candidateEmail = $application['email'];
        $offerTitle = $application['offer_title'];

        if ($candidateEmail) {
            $subject = $status === 'accepted' ? "Candidature acceptee - $offerTitle" : "Candidature refusee - $offerTitle";
            if ($status === 'accepted') {
                $message = "Bonjour $candidateName,\n\nFélicitations ! Votre candidature pour le poste '$offerTitle' a été acceptée.\nNous vous invitons à contacter l'entreprise pour fixer un entretien et convenir d'une date.\n\nCordialement,\nL'équipe CareerPropulse";
            } else {
                $message = "Bonjour $candidateName,\n\nMerci d'avoir postulé pour le poste '$offerTitle'. Après examen, votre candidature n'a pas été retenue pour cette fois.\nNous vous encourageons à postuler à d'autres opportunités.\n\nCordialement,\nL'équipe CareerPropulse";
            }

            $headers = 'From: no-reply@careerpropulse.local\r\n' .
                'Reply-To: no-reply@careerpropulse.local\r\n' .
                'X-Mailer: PHP/' . phpversion();
            @mail($candidateEmail, $subject, $message, $headers);
        }

        respond(200, ['success' => true, 'message' => 'Statut mis à jour et notification envoyée']);
    } catch (Exception $e) {
        respond(500, [
            'success' => false,
            'message' => 'Erreur lors de la mise a jour du statut',
            'error' => $e->getMessage()
        ]);
    }
}

if ($action === 'get_employer_offers') {
    requireRole('employeur');

    try {
        $stmt = $pdo->prepare(
            "SELECT id, title, description, location, domaine, required_skills, created_at, updated_at
             FROM job_offers
             WHERE employer_id = ?
             ORDER BY created_at DESC"
        );
        $stmt->execute([$_SESSION['user_id']]);
        $offers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        respond(200, ['success' => true, 'offers' => $offers]);
    } catch (PDOException $e) {
        respond(500, [
            'success' => false,
            'message' => 'Erreur lors de la récupération des offres',
            'error' => $e->getMessage()
        ]);
    }
}

if ($action === 'get_my_applications') {
    requireRole('employe');

    try {
        $stmt = $pdo->prepare('
            SELECT a.*, jo.title, jo.description, jo.location, jo.domaine, c.company as company_name
            FROM applications a
            JOIN job_offers jo ON a.offer_id = jo.id
            JOIN `cv-employeur` c ON jo.employer_id = c.id
            WHERE a.candidate_id = ?
            ORDER BY a.created_at DESC
        ');
        $stmt->execute([$_SESSION['user_id']]);
        $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

        respond(200, [
            'success' => true,
            'applications' => $applications
        ]);
    } catch (Exception $e) {
        respond(500, [
            'success' => false,
            'message' => 'Erreur lors de la récupération des candidatures',
            'error' => $e->getMessage()
        ]);
    }
}

respond(404, ['success' => false, 'message' => 'Action non reconnue']);
=======
            echo json_encode(['success' => true, 'message' => 'Connexion réussie', 'role' => 'employeur']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
        }
    } else {
        $stmt = $pdo->prepare("SELECT * FROM employees WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = 'employe';
            echo json_encode(['success' => true, 'message' => 'Connexion réussie', 'role' => 'employe']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
        }
    }
    exit;
}

// AJOUTER UNE OFFRE D'EMPLOI
if ($action === 'add_offer') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Non authentifié']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $location = $data['location'] ?? '';

    if (!$title) {
        echo json_encode(['success' => false, 'message' => 'Titre requis']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO job_offers (employer_id, title, description, location) VALUES (?, ?, ?, ?)");
    $stmt->execute([$_SESSION['user_id'], $title, $description, $location]);

    echo json_encode(['success' => true, 'message' => 'Offre ajoutée']);
    exit;
}

// RÉCUPÉRER LES OFFRES
if ($action === 'get_offers') {
    $stmt = $pdo->query("SELECT o.*, c.nom_company FROM job_offers o JOIN `cv-employeur` c ON o.employer_id = c.mail ORDER BY o.created_at DESC");
    $offers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'offers' => $offers]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Action non reconnue']);
>>>>>>> ca0e8c04de280631265df0e99a1c462b2e1a3d54
