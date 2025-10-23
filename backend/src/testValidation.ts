// Simple test script to verify game creation validation
const testCases = [
  { nickname: '', socketId: 'socket123', shouldFail: true, errorContains: 'Nickname is required' },
  { nickname: '   ', socketId: 'socket123', shouldFail: true, errorContains: 'Nickname is required' },
  { nickname: 'A', socketId: 'socket123', shouldFail: true, errorContains: 'at least 2 characters' },
  { nickname: 'A'.repeat(21), socketId: 'socket123', shouldFail: true, errorContains: 'at most 20 characters' },
  { nickname: 'ValidName', socketId: '', shouldFail: true, errorContains: 'Socket ID is required' },
  { nickname: 'ValidName', socketId: 'socket123', shouldFail: false },
];

async function runTests() {
  // Import after connecting to database
  await import('./config/database').then(db => db.connectDatabase());
  const { gameService } = await import('./services/gameService');
  const GameModel = (await import('./models/Game')).default;

  console.log('Running game creation validation tests...\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const game = await gameService.createGame(testCase.nickname, testCase.socketId);
      
      if (testCase.shouldFail) {
        console.log(`❌ FAIL: Expected error for nickname="${testCase.nickname}", socketId="${testCase.socketId}"`);
        failed++;
        // Clean up
        await GameModel.deleteOne({ _id: game._id });
      } else {
        console.log(`✅ PASS: Successfully created game for nickname="${testCase.nickname}"`);
        passed++;
        // Clean up
        await GameModel.deleteOne({ _id: game._id });
      }
    } catch (error) {
      if (testCase.shouldFail) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes(testCase.errorContains)) {
          console.log(`✅ PASS: Correctly rejected nickname="${testCase.nickname}" with error: "${errorMessage}"`);
          passed++;
        } else {
          console.log(`❌ FAIL: Wrong error message for nickname="${testCase.nickname}". Expected "${testCase.errorContains}", got "${errorMessage}"`);
          failed++;
        }
      } else {
        console.log(`❌ FAIL: Unexpected error for valid input nickname="${testCase.nickname}": ${error instanceof Error ? error.message : String(error)}`);
        failed++;
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(50)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
