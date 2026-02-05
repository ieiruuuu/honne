/**
 * Seeding Script for Development Environment
 * 
 * Usage:
 *   npm run seed       // Add test data
 *   npm run seed:clean // Remove test data
 *   npm run seed:count // Check test data count
 */

import { seedTestPosts, cleanupTestPosts, countTestPosts } from '../src/lib/seedData';

async function main() {
  const command = process.argv[2] || 'seed';
  
  console.log('🚀 Seed Script Starting...\n');
  
  try {
    switch (command) {
      case 'seed':
        console.log('📝 Mode: SEED (Add test data)');
        console.log('─────────────────────────────\n');
        await seedTestPosts();
        break;
        
      case 'clean':
      case 'cleanup':
        console.log('🧹 Mode: CLEANUP (Remove test data)');
        console.log('─────────────────────────────\n');
        await cleanupTestPosts();
        break;
        
      case 'count':
        console.log('📊 Mode: COUNT (Check test data)');
        console.log('─────────────────────────────\n');
        await countTestPosts();
        break;
        
      default:
        console.log('❌ Unknown command:', command);
        console.log('\nAvailable commands:');
        console.log('  seed    - Add test data');
        console.log('  clean   - Remove test data');
        console.log('  count   - Check test data count');
        process.exit(1);
    }
    
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

main();
