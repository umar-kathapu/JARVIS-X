import { prisma, disconnectPrisma } from './prisma.js';
import { logger } from '../utils/logger.js';

async function main() {
  logger.info('🌱 Seeding complete enterprise database schema...');

  // 1. Roles & Permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System Administrator with full access',
    },
  });

  const operatorRole = await prisma.role.upsert({
    where: { name: 'OPERATOR' },
    update: {},
    create: {
      name: 'OPERATOR',
      description: 'Standard Operator with execution rights',
    },
  });

  const sysReadPerm = await prisma.permission.upsert({
    where: { action_resource: { action: 'read', resource: 'system' } },
    update: {},
    create: {
      action: 'read',
      resource: 'system',
      description: 'Read system status and logs',
    },
  });

  // 2. Default Administrator Account
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@jarvis-x.ai' },
    update: {},
    create: {
      email: 'admin@jarvis-x.ai',
      name: 'JARVIS-X System Administrator',
      roleEnum: 'ADMIN',
      roleId: adminRole.id,
      settings: {
        create: {
          defaultModel: 'gpt-4o',
          notificationsEnabled: true,
        },
      },
      theme: {
        create: {
          themeName: 'dark',
          accentColor: '#6366F1',
        },
      },
    },
  });

  logger.info({ adminId: adminUser.id }, '✅ Admin user and roles seeded');

  // 3. AI Models Configuration
  const defaultModel = await prisma.aIModel.upsert({
    where: { name: 'GPT-4o' },
    update: {},
    create: {
      name: 'GPT-4o',
      provider: 'openai',
      modelCode: 'gpt-4o',
      contextWindow: 128000,
      isDefault: true,
      configurations: {
        create: {
          temperature: 0.7,
          topP: 1.0,
          maxTokens: 4096,
          systemPrompt: 'You are JARVIS-X, an advanced autonomous AI assistant.',
        },
      },
    },
  });

  logger.info({ modelId: defaultModel.id }, '✅ Default AI Model registered');

  // 4. Default System Plugins
  await prisma.plugin.upsert({
    where: { name: 'core-ai-orchestrator' },
    update: {},
    create: {
      name: 'core-ai-orchestrator',
      version: '1.0.0',
      description: 'JARVIS-X Core Agent & Tool Execution Plugin',
      author: 'JARVIS-X AI Team',
      enabled: true,
      settings: {
        create: {
          key: 'maxConcurrentSubagents',
          value: 10,
        },
      },
    },
  });

  // 5. Prompt Templates
  await prisma.promptTemplate.upsert({
    where: { name: 'code-review-template' },
    update: {},
    create: {
      name: 'code-review-template',
      description: 'Automated code review & refactoring prompt',
      content: 'Review the following code for security vulnerabilities, memory leaks, and performance optimization:\n\n{{code}}',
      variables: ['code'],
    },
  });

  // 6. Application Configuration & Feature Flags
  await prisma.applicationConfig.upsert({
    where: { key: 'SYSTEM_MAINTENANCE_MODE' },
    update: {},
    create: {
      key: 'SYSTEM_MAINTENANCE_MODE',
      value: false,
    },
  });

  await prisma.featureFlag.upsert({
    where: { name: 'ENABLE_VECTOR_MEMORY' },
    update: {},
    create: {
      name: 'ENABLE_VECTOR_MEMORY',
      description: 'Enable Semantic Vector Search Memory',
      isEnabled: true,
      rolloutPct: 100,
    },
  });

  logger.info('🎉 Enterprise database seeding complete.');
}

main()
  .catch((e) => {
    logger.error({ error: e }, '❌ Database seeding error');
    process.exit(1);
  })
  .finally(async () => {
    await disconnectPrisma();
  });
