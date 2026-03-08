// Quick setup script to create .env file
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=== Backend Environment Setup ===\n');
console.log('This script will help you create the .env file.\n');

const questions = [
  {
    key: 'DATABASE_URL',
    prompt: 'Enter your Supabase DATABASE_URL (from Supabase dashboard):\n',
    default: 'postgresql://postgres:password@project-ref.supabase.co:5432/postgres?sslmode=require'
  },
  {
    key: 'PORT',
    prompt: 'Enter server PORT (default: 3000):\n',
    default: '3000'
  },
  {
    key: 'NODE_ENV',
    prompt: 'Enter NODE_ENV (default: development):\n',
    default: 'development'
  },
  {
    key: 'CORS_ORIGIN',
    prompt: 'Enter CORS_ORIGIN (default: http://localhost:4200):\n',
    default: 'http://localhost:4200'
  },
  {
    key: 'SCHEDULER_API_KEY',
    prompt: 'Enter SCHEDULER_API_KEY (any secure string):\n',
    default: 'dev-scheduler-key-' + Math.random().toString(36).substring(7)
  }
];

const answers = {};
let currentQuestion = 0;

function askQuestion() {
  if (currentQuestion >= questions.length) {
    createEnvFile();
    return;
  }

  const q = questions[currentQuestion];
  rl.question(q.prompt + `(default: ${q.default}): `, (answer) => {
    answers[q.key] = answer.trim() || q.default;
    currentQuestion++;
    askQuestion();
  });
}

function createEnvFile() {
  const envContent = `# Database Configuration
DATABASE_URL=${answers.DATABASE_URL}

# Server Configuration
PORT=${answers.PORT}
NODE_ENV=${answers.NODE_ENV}

# CORS Configuration
CORS_ORIGIN=${answers.CORS_ORIGIN}

# Scheduler API Key
SCHEDULER_API_KEY=${answers.SCHEDULER_API_KEY}
`;

  fs.writeFileSync('.env', envContent);
  console.log('\n✅ .env file created successfully!\n');
  console.log('You can now run: npm run dev\n');
  rl.close();
}

askQuestion();
