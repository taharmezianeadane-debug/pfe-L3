-- ==========================================
-- CAREERPROPULSE - DONNÉES DE DÉMO FINALES
-- ==========================================

SET FOREIGN_KEY_CHECKS=0;

-- ==========================================
-- EMPOYEURS (Recruteurs)
-- ==========================================

DELETE FROM `cv-employeur`;
INSERT INTO `cv-employeur` (mail, password, nom_company, nom, poste, secteur, taille, localisation, profile_summary, created_at, updated_at) VALUES
('employer1@careerpropulse.com', '$2y$10$WOelNfPWE9rV/0ygM0rGKuP1Y0nM5zH/9O0F.5Q9M1vQ9K3K3aX4m', 'TechCorp Solutions', 'Ahmed Bouali', 'Responsable RH', 'IT', 'PME', 'Tunis', 'TechCorp est une entreprise spécialisée dans les solutions web et mobile innovantes.', NOW(), NOW());

-- ==========================================
-- CANDIDATS (Employés)
-- ==========================================

DELETE FROM employees;
INSERT INTO employees (email, password, prenom, nom, telephone, titre, cv_summary, skills_json, languages_json, experiences_json, formations_json, certificates_json, created_at, updated_at) VALUES
(
    'ahmed.candidate@careerpropulse.com',
    '$2y$10$WOelNfPWE9rV/0ygM0rGKuP1Y0nM5zH/9O0F.5Q9M1vQ9K3K3aX4m',
    'Ahmed',
    'Mohamed',
    '+216 20 123 456',
    'Développeur Backend',
    'Développeur PHP expérimenté avec 3 ans d\'expérience en développement web',
    '["PHP", "JavaScript", "MySQL", "CSS", "HTML", "Apache", "Linux"]',
    '["Français", "Anglais", "Arabe"]',
    '[{"title": "Développeur PHP", "company": "WebDev SA", "duration": "2021-2024"}]',
    '[{"diplome": "bac+3", "field": "Informatique", "school": "ISET Sfax"}]',
    '[{"title": "PHP Advanced", "issuer": "Udemy"}]',
    NOW(), NOW()
),
(
    'fatima.candidate@careerpropulse.com',
    '$2y$10$WOelNfPWE9rV/0ygM0rGKuP1Y0nM5zH/9O0F.5Q9M1vQ9K3K3aX4m',
    'Fatima',
    'Benali',
    '+216 21 234 567',
    'Développeur Frontend',
    'Développeur Frontend spécialisé en React avec 2 ans d\'expérience',
    '["React", "Vue.js", "JavaScript", "CSS", "HTML", "TypeScript", "Webpack"]',
    '["Français", "Anglais"]',
    '[{"title": "Développeur Frontend", "company": "Digital Agency", "duration": "2022-2024"}]',
    '[{"diplome": "bac+4", "field": "Informatique", "school": "Université La Manouba"}]',
    '[{"title": "React Expert", "issuer": "Coursera"}]',
    NOW(), NOW()
),
(
    'karim.candidate@careerpropulse.com',
    '$2y$10$WOelNfPWE9rV/0ygM0rGKuP1Y0nM5zH/9O0F.5Q9M1vQ9K3K3aX4m',
    'Karim',
    'Dupre',
    '+216 22 345 678',
    'DevOps Engineer',
    'Ingénieur DevOps passionné par l\'infrastructure et l\'automatisation',
    '["Linux", "Docker", "Kubernetes", "AWS", "Python", "Bash", "Jenkins"]',
    '["Français", "Anglais", "Allemand"]',
    '[{"title": "DevOps Engineer", "company": "Cloud Infra Inc", "duration": "2020-2024"}]',
    '[{"diplome": "bac+5", "field": "Telecoms", "school": "Supcom Tunis"}]',
    '[{"title": "Kubernetes Certified", "issuer": "Linux Foundation"}]',
    NOW(), NOW()
);

-- ==========================================
-- OFFRES D'EMPLOI
-- ==========================================

DELETE FROM job_offers;
INSERT INTO job_offers (employer_id, title, description, location, domaine, competences_requises, langues_requises, diplome_requis, created_at, updated_at) VALUES
(
    'employer1@careerpropulse.com',
    'Développeur PHP Senior',
    'Nous recherchons un développeur PHP senior pour rejoindre notre équipe backend. Vous travaillerez sur des projets innovants et modernes.',
    'Tunis',
    'backend',
    'PHP, JavaScript, MySQL, CSS, HTML',
    'Français, Anglais',
    'bac+3',
    NOW(), NOW()
),
(
    'employer1@careerpropulse.com',
    'Développeur Frontend React',
    'Nous recherchons un développeur frontend React enthousiaste pour créer d\'excellentes expériences utilisateur.',
    'Tunis',
    'frontend',
    'React, Vue.js, JavaScript, CSS, HTML, TypeScript',
    'Français, Anglais',
    'bac+4',
    NOW(), NOW()
),
(
    'employer1@careerpropulse.com',
    'DevOps Engineer',
    'Nous recherchons un DevOps engineer pour gérer notre infrastructure cloud et l\'automatisation.',
    'Tunis',
    'devops',
    'Linux, Docker, Kubernetes, AWS, Python',
    'Français, Anglais',
    'bac+5',
    NOW(), NOW()
),
(
    'employer1@careerpropulse.com',
    'Solution Architect',
    'Nous recherchons un solution architect expérimenté pour guider nos projets technologiques.',
    'Tunis',
    'gestion',
    'PHP, React, Docker, AWS, Python',
    'Français, Anglais',
    'bac+5',
    NOW(), NOW()
);

-- ==========================================
-- APPLICATIONS (Candidatures)
-- ==========================================

DELETE FROM applications;
-- Les applications seront créées quand les candidats postulent

SET FOREIGN_KEY_CHECKS=1;
