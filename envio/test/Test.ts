import assert from "assert";
import { 
  TestHelpers,
  MiraV1Core_ReentrancyError
} from "generated";
const { MockDb, MiraV1Core } = TestHelpers;

describe("MiraV1Core contract ReentrancyError event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for MiraV1Core contract ReentrancyError event
  const event = MiraV1Core.ReentrancyError.mock({data: {} /* It mocks event fields with default values, so you only need to provide data */});

  it("MiraV1Core_ReentrancyError is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await MiraV1Core.ReentrancyError.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualMiraV1CoreReentrancyError = mockDbUpdated.entities.MiraV1Core_ReentrancyError.get(
      `${event.chainId}_${event.block.height}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedMiraV1CoreReentrancyError: MiraV1Core_ReentrancyError = {
      id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualMiraV1CoreReentrancyError, expectedMiraV1CoreReentrancyError, "Actual MiraV1CoreReentrancyError should be the same as the expectedMiraV1CoreReentrancyError");
  });
});
