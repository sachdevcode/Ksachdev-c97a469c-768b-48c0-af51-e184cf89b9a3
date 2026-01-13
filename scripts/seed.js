const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function seed() {
    const db = new sqlite3.Database('database.sqlite');

    const hashedPassword = await bcrypt.hash('password', 10);

    db.serialize(() => {
        // Create tables
        db.run(`CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parentId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      role TEXT NOT NULL,
      organizationId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      category TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      organizationId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      resourceId TEXT NOT NULL,
      metadata TEXT,
      timestamp TEXT NOT NULL
    )`);

        // Clear existing data
        db.run('DELETE FROM tasks');
        db.run('DELETE FROM users');
        db.run('DELETE FROM organizations');
        db.run('DELETE FROM audit_logs');

        const now = new Date().toISOString();

        // Insert organizations
        db.run(`INSERT INTO organizations VALUES ('org-1', 'Acme Corporation', NULL, '${now}', '${now}')`);
        db.run(`INSERT INTO organizations VALUES ('org-2', 'Acme Engineering', 'org-1', '${now}', '${now}')`);

        // Insert users
        db.run(`INSERT INTO users VALUES ('user-1', 'owner@example.com', '${hashedPassword}', 'John', 'Owner', 'owner', 'org-1', '${now}', '${now}')`);
        db.run(`INSERT INTO users VALUES ('user-2', 'admin@example.com', '${hashedPassword}', 'Jane', 'Admin', 'admin', 'org-1', '${now}', '${now}')`);
        db.run(`INSERT INTO users VALUES ('user-3', 'viewer@example.com', '${hashedPassword}', 'Bob', 'Viewer', 'viewer', 'org-2', '${now}', '${now}')`);

        // Insert tasks
        db.run(`INSERT INTO tasks VALUES ('task-1', 'Complete project documentation', 'Write comprehensive docs for the RBAC system', 'todo', 'work', 'user-1', 'org-1', '${now}', '${now}')`);
        db.run(`INSERT INTO tasks VALUES ('task-2', 'Review pull requests', 'Review and merge pending PRs', 'in_progress', 'work', 'user-2', 'org-1', '${now}', '${now}')`);
        db.run(`INSERT INTO tasks VALUES ('task-3', 'Update dependencies', 'Update npm packages to latest versions', 'done', 'work', 'user-1', 'org-1', '${now}', '${now}')`);
        db.run(`INSERT INTO tasks VALUES ('task-4', 'Team meeting preparation', 'Prepare slides for weekly team meeting', 'todo', 'work', 'user-3', 'org-2', '${now}', '${now}')`);
        db.run(`INSERT INTO tasks VALUES ('task-5', 'Personal: Learn TypeScript', 'Complete TypeScript course on Udemy', 'in_progress', 'personal', 'user-3', 'org-2', '${now}', '${now}')`, () => {
            console.log('✅ Database seeded successfully!');
            console.log('\n📧 Demo Credentials:');
            console.log('Owner: owner@example.com / password');
            console.log('Admin: admin@example.com / password');
            console.log('Viewer: viewer@example.com / password');
            console.log('\n🚀 Start the backend: npm run api');
            console.log('🎨 Start the frontend: npm run dashboard');

            db.close();
        });
    });
}

seed().catch(console.error);
