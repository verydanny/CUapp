// @ts-nocheck
import Benchmark from 'benchmark';

// Mock post type for testing
interface Post {
    userId: string;
    id: string;
    content: string;
}

// Generate test data with different characteristics
function generatePosts(count: number, uniqueUserRatio: number = 0.1): Post[] {
    const posts: Post[] = [];
    const uniqueUserCount = Math.ceil(count * uniqueUserRatio);

    for (let i = 0; i < count; i++) {
        posts.push({
            userId: `user-${Math.floor(Math.random() * uniqueUserCount)}`,
            id: `post-${i}`,
            content: `Post content ${i}`
        });
    }

    return posts;
}

// Test data sets
const smallPosts = generatePosts(100, 0.2); // 100 posts, ~20 unique users
const mediumPosts = generatePosts(1000, 0.1); // 1000 posts, ~100 unique users
const largePosts = generatePosts(10000, 0.05); // 10000 posts, ~500 unique users

// Benchmark functions
const approaches = {
    // Control: Original 3-pass approach
    control: (posts: Post[]) => {
        return Array.from(new Set(posts.map((post) => post.userId))).join(',');
    },

    // Approach 1: Reduce with Set
    reduceWithSet: (posts: Post[]) => {
        return Array.from(
            posts.reduce((userIds, post) => userIds.add(post.userId), new Set<string>())
        ).join(',');
    },

    // Approach 2: for...of with Set
    forOfWithSet: (posts: Post[]) => {
        const userIds = new Set<string>();
        for (const post of posts) {
            userIds.add(post.userId);
        }
        return Array.from(userIds).join(',');
    },

    // Approach 3: Reduce with Array (O(n²))
    reduceWithArray: (posts: Post[]) => {
        return posts
            .reduce((acc, post) => {
                if (!acc.includes(post.userId)) {
                    acc.push(post.userId);
                }
                return acc;
            }, [] as string[])
            .join(',');
    },

    // Approach 4: for...of with Set and string building
    forOfSetString: (posts: Post[]) => {
        const userIdsSet = new Set<string>();
        let uniqueUserIds = '';
        for (const post of posts) {
            if (!userIdsSet.has(post.userId)) {
                userIdsSet.add(post.userId);
                uniqueUserIds += (uniqueUserIds ? ',' : '') + post.userId;
            }
        }
        return uniqueUserIds;
    },

    // Approach 5: Reduce with string includes (O(n²))
    reduceWithStringIncludes: (posts: Post[]) => {
        return posts.reduce((acc, post) => {
            const separator = acc ? ',' : '';
            // Split, check, and rejoin to avoid partial matches
            const existingIds = acc ? acc.split(',') : [];
            return existingIds.includes(post.userId) ? acc : acc + separator + post.userId;
        }, '');
    },

    // Approach 6: Traditional for loop with Set (fastest)
    traditionalForWithSet: (posts: Post[]) => {
        const seen = new Set<string>();
        let uniqueUserIds = '';

        for (let i = 0; i < posts.length; i++) {
            const userId = posts[i].userId;
            if (userId && !seen.has(userId)) {
                seen.add(userId);
                uniqueUserIds += (uniqueUserIds ? ',' : '') + userId;
            }
        }
        return uniqueUserIds;
    }
};

// Verify all approaches return the same result
function verifyApproaches(posts: Post[]) {
    const results = Object.entries(approaches).map(([name, fn]) => ({
        name,
        result: fn(posts).split(',').sort().join(',')
    }));

    const baseline = results[0]?.result;
    const allMatch = baseline && results.every((r) => r.result === baseline);

    if (!allMatch) {
        console.error("❌ Results don't match!");
        results.forEach((r) => console.log(`${r.name}: ${r.result.slice(0, 100)}...`));
        return false;
    }

    console.log('✅ All approaches return the same result');
    return true;
}

// Run benchmarks for a specific dataset
function runBenchmarkSuite(posts: Post[], datasetName: string) {
    console.log(
        `\n🧪 Running benchmarks for ${datasetName} (${posts.length} posts, ~${new Set(posts.map((p) => p?.userId).filter(Boolean)).size} unique users)`
    );
    console.log('='.repeat(80));

    if (!verifyApproaches(posts)) {
        return;
    }

    const suite = new Benchmark.Suite();

    // Add all approaches to the suite
    Object.entries(approaches).forEach(([name, fn]) => {
        suite.add(name, () => fn(posts));
    });

    suite
        .on('cycle', (event: any) => {
            const benchmark = event.target;
            const opsPerSec = Benchmark.formatNumber(benchmark.hz.toFixed(0));
            console.log(
                `${benchmark.name.padEnd(25)} ${opsPerSec.padStart(15)} ops/sec ±${benchmark.stats.rme.toFixed(2)}%`
            );
        })
        .on('complete', function (this: any) {
            const fastest = this.filter('fastest');
            const slowest = this.filter('slowest');

            console.log('\n📊 Results:');
            console.log(`🏆 Fastest: ${fastest.map((b: any) => b.name).join(', ')}`);
            console.log(`🐌 Slowest: ${slowest.map((b: any) => b.name).join(', ')}`);

            if (fastest.length === 1 && slowest.length === 1) {
                const speedup = (fastest[0].hz / slowest[0].hz).toFixed(2);
                console.log(`⚡ Speed difference: ${speedup}x faster`);
            }
        })
        .run({ async: true });
}

// Run all benchmark suites
export function runAllBenchmarks() {
    console.log('🚀 Starting Unique User ID Extraction Benchmarks');
    console.log('Testing different approaches for extracting unique user IDs from posts arrays');

    // Run benchmarks for different dataset sizes
    runBenchmarkSuite(smallPosts, 'Small Dataset');

    setTimeout(() => {
        runBenchmarkSuite(mediumPosts, 'Medium Dataset');
    }, 2000);

    setTimeout(() => {
        runBenchmarkSuite(largePosts, 'Large Dataset');
    }, 4000);
}

// Export for potential individual testing
export { approaches, generatePosts, verifyApproaches };
