/**
 * Database Stress Test & Time Distribution Seeder
 * 
 * Purpose: Test time-based sorting and category filtering
 * Environment: Development only
 */

import { supabase } from './supabase';

// Static sample data (neutral test content)
const SAMPLE_POSTS = [
  "オンナ 야근이다",
  "月給日だけを待つ",
  "転職したい",
  "上司の小言が爆発",
  "コーヒー3杯目"
];

// Categories for testing
const CATEGORIES = [
  '年収・手取り',
  'ホワイト・ブラック判定',
  'ボーナス報告',
  '転職のホンネ',
  '人間関係・上司',
  '社内政治・派閥',
  'サービス残業・待遇',
  '福利厚生・環境',
  'メンタル・悩み',
  'つぶやき'
] as const;

/**
 * Generate random timestamp between 17:00 and 23:00 today
 */
function getRandomEveningTimestamp(): string {
  const today = new Date();
  today.setHours(17, 0, 0, 0); // Start: 17:00:00
  
  const startTime = today.getTime();
  const endTime = today.getTime() + (6 * 60 * 60 * 1000); // +6 hours (until 23:00)
  
  const randomTime = startTime + Math.random() * (endTime - startTime);
  const randomDate = new Date(randomTime);
  
  return randomDate.toISOString();
}

/**
 * Get random item from array
 */
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate random nickname for test data
 */
function generateTestNickname(index: number): string {
  const prefixes = ['テスト', '開発', 'デモ', 'サンプル'];
  const suffixes = ['ユーザー', '社員', '投稿者', '参加者'];
  
  const prefix = getRandomItem(prefixes);
  const suffix = getRandomItem(suffixes);
  
  return `${prefix}${suffix}${index}`;
}

/**
 * Main seeding function
 * Creates 3 posts per category with randomized evening timestamps
 */
export async function seedTestPosts() {
  console.log('🌱 Starting database stress test seeding...');
  
  const postsToInsert = [];
  let postIndex = 1;
  
  // Loop through each category
  for (const category of CATEGORIES) {
    // Create 3 posts per category
    for (let i = 0; i < 3; i++) {
      const post = {
        content: getRandomItem(SAMPLE_POSTS),
        category: category,
        nickname: generateTestNickname(postIndex),
        created_at: getRandomEveningTimestamp(),
        likes_count: 0,
        // Mark as test data for easy cleanup
        // is_test_data: true // Uncomment if you add this column
      };
      
      postsToInsert.push(post);
      postIndex++;
    }
  }
  
  // Insert all posts
  const { data, error } = await supabase
    .from('posts')
    .insert(postsToInsert)
    .select();
  
  if (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
  
  console.log(`✅ Successfully seeded ${postsToInsert.length} test posts`);
  console.log(`📊 Distribution: ${CATEGORIES.length} categories × 3 posts each`);
  console.log(`⏰ Time range: 17:00 - 23:00 (randomized)`);
  
  return data;
}

/**
 * Cleanup function - removes all test posts
 * Use this after testing is complete
 */
export async function cleanupTestPosts() {
  console.log('🧹 Cleaning up test posts...');
  
  // Delete posts with test nicknames
  const { error } = await supabase
    .from('posts')
    .delete()
    .or('nickname.like.テスト%,nickname.like.開発%,nickname.like.デモ%,nickname.like.サンプル%');
  
  if (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
  
  console.log('✅ Test posts cleaned up successfully');
}

/**
 * Utility: Check current test post count
 */
export async function countTestPosts() {
  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .or('nickname.like.テスト%,nickname.like.開発%,nickname.like.デモ%,nickname.like.サンプル%');
  
  if (error) {
    console.error('❌ Count failed:', error);
    return 0;
  }
  
  console.log(`📊 Current test posts: ${count}`);
  return count;
}

// Export for CLI usage
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'seed':
      seedTestPosts().then(() => process.exit(0)).catch(() => process.exit(1));
      break;
    case 'cleanup':
      cleanupTestPosts().then(() => process.exit(0)).catch(() => process.exit(1));
      break;
    case 'count':
      countTestPosts().then(() => process.exit(0)).catch(() => process.exit(1));
      break;
    default:
      console.log('Usage: ts-node seedData.ts [seed|cleanup|count]');
      process.exit(1);
  }
}
