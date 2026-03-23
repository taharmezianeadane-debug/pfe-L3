<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');

session_start();

include 'config.php';

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
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'employe';

    if (!$email || !$password) {
        echo json_encode(['success' => false, 'message' => 'Email et mot de passe requis']);
        exit;
    }

    if ($role === 'employeur') {
        $stmt = $pdo->prepare("SELECT * FROM `cv-employeur` WHERE mail = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['mail'];
            $_SESSION['email'] = $user['mail'];
            $_SESSION['role'] = 'employeur';
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
