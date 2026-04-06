<?php
require 'config.php';
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Base de données - CareerPulse</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #333; margin-bottom: 30px; }
        .table-section { background: white; margin-bottom: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
        .table-title { background: #2c3e50; color: white; padding: 15px 20px; font-size: 16px; font-weight: bold; }
        .table-info { padding: 15px 20px; background: #ecf0f1; }
        .table-data { padding: 0; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #34495e; color: white; padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 12px; border-bottom: 1px solid #ecf0f1; }
        tr:hover { background: #f9f9f9; }
        .col-name { font-weight: bold; color: #2980b9; }
        .col-type { color: #e74c3c; font-family: monospace; }
        .col-null { color: #27ae60; font-size: 12px; }
        .rows-count { background: #3498db; color: white; padding: 8px 12px; border-radius: 4px; display: inline-block; }
        .error { color: #e74c3c; background: #fadbd8; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .success { color: #27ae60; background: #d5f4e6; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Structure de la Base de Données CareerPulse</h1>

        <?php
        try {
            // Récupérer toutes les tables
            $stmt = $pdo->query("SHOW TABLES FROM careerpropulse");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

            if (empty($tables)) {
                echo '<div class="error">❌ Aucune table trouvée dans la base de données</div>';
            } else {
                echo '<div class="success">✅ Connecté à la base de données "careerpropulse" - ' . count($tables) . ' table(s) trouvée(s)</div>';

                foreach ($tables as $table) {
                    // Obtenir les informations de la table
                    $stmt = $pdo->query("DESCRIBE `$table`");
                    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    // Compter les lignes
                    $countStmt = $pdo->query("SELECT COUNT(*) as cnt FROM `$table`");
                    $rowCount = $countStmt->fetch(PDO::FETCH_ASSOC)['cnt'];

                    echo '<div class="table-section">';
                    echo '<div class="table-title">📋 Tableau: <code>' . htmlspecialchars($table) . '</code></div>';
                    echo '<div class="table-info"><span class="rows-count">' . $rowCount . ' ligne(s)</span></div>';
                    echo '<div class="table-data"><table>';
                    echo '<tr><th>Colonne</th><th>Type</th><th>Null?</th><th>Clé</th><th>Par défaut</th><th>Extra</th></tr>';

                    foreach ($columns as $col) {
                        echo '<tr>';
                        echo '<td class="col-name">' . htmlspecialchars($col['Field']) . '</td>';
                        echo '<td class="col-type">' . htmlspecialchars($col['Type']) . '</td>';
                        echo '<td class="col-null">' . ($col['Null'] === 'YES' ? '✓ OUI' : '✗ NON') . '</td>';
                        echo '<td>' . htmlspecialchars($col['Key'] ?: '-') . '</td>';
                        echo '<td><code>' . htmlspecialchars($col['Default'] ?? 'NULL') . '</code></td>';
                        echo '<td>' . htmlspecialchars($col['Extra'] ?: '-') . '</td>';
                        echo '</tr>';
                    }

                    echo '</table></div>';
                    echo '</div>';
                }
            }
        } catch (Exception $e) {
            echo '<div class="error">❌ Erreur: ' . htmlspecialchars($e->getMessage()) . '</div>';
        }
        ?>
    </div>
</body>
</html>
