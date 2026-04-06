-- ============================================
-- TEST DATA SETUP FOR CAREERPROPULSE
-- ============================================

-- Clear test accounts
DELETE FROM `cv-employe` WHERE email IN ('candidat@test.com');
DELETE FROM `cv-employeur` WHERE mail IN ('employeur@test.com');
DELETE FROM job_offers WHERE title IN ('Développeur Web Full Stack', 'Architecte Logiciel Senior', 'Developer Frontend React');

-- ============================================
-- 1. CREATE TEST CANDIDATE ACCOUNT
-- ============================================
-- Password: pass123456 (hashed with bcrypt)
-- Bcrypt hash: $2y$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUe.8mkm

INSERT INTO `cv-employe` 
(email, password, prenom, nom, diplome, skills, langues, created_at) 
VALUES (
  'candidat@test.com',
  '$2y$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUe.8mkm',
  'Ahmed',
  'Saidane',
  'bac+3',
  'javascript,php,mysql,html,css,react,nodejs',
  'francais,anglais',
  NOW()
);

-- ============================================
-- 2. CREATE TEST EMPLOYER ACCOUNT
-- ============================================
INSERT INTO `cv-employeur` 
(mail, password, name, company, poste, created_at) 
VALUES (
  'employeur@test.com',
  '$2y$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUe.8mkm',
  'Tech Recruiter',
  'TechCorp Solutions',
  'HR Manager',
  NOW()
);

-- ============================================
-- 3. CREATE TEST JOB OFFERS
-- ============================================

-- Get employer ID (usually 1 if first account)
-- Offer 1: Web Developer (MATCH)
INSERT INTO job_offers 
(employer_id, title, description, location, domaine, competences_requises, langues_requises, diplome_requis, created_at) 
VALUES (
  1,
  'Développeur Web Full Stack',
  'Nous recherchons un développeur web expérimenté pour rejoindre notre équipe dynamique.',
  'Paris',
  'backend',
  'javascript,php,mysql,html,css,react,nodejs',
  'francais,anglais',
  'bac+3',
  NOW()
);

-- Offer 2: Senior Architect (NO MATCH - requires Java, Docker, Kubernetes)
INSERT INTO job_offers 
(employer_id, title, description, location, domaine, competences_requises, langues_requises, diplome_requis, created_at) 
VALUES (
  1,
  'Architecte Logiciel Senior',
  'Nous cherchons un architecte avec 10 ans d\'expérience en architecture logiciel complexe.',
  'Lyon',
  'backend',
  'java,spring,docker,kubernetes,aws',
  'anglais,chinois',
  'bac+5',
  NOW()
);

-- Offer 3: Frontend Developer (MATCH)
INSERT INTO job_offers 
(employer_id, title, description, location, domaine, competences_requises, langues_requises, diplome_requis, created_at) 
VALUES (
  1,
  'Developer Frontend React',
  'Rejoignez notre équipe frontend pour développer des interfaces modernes et réactives.',
  'Télétravail',
  'frontend',
  'javascript,html,css,react',
  'francais',
  'bac+2',
  NOW()
);

-- SUCCESS
SELECT '✅ TEST DATA CREATED SUCCESSFULLY' as status;
