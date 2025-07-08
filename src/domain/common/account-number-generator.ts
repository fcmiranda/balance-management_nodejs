/**
 * Generates a unique account number based on user ID and timestamp.
 * Format: [1-9][user_id_last_2][timestamp_last_6][random_2]
 * Example: For user 123 at timestamp ending in 553123 and random 42 -> 7234553142
 *
 * @param userId The ID of the user owning the account
 * @returns A unique 10-digit account number
 */
export function generateAccountNumber(userId: number): string {
  // Get current timestamp in milliseconds
  const timestamp = Date.now();

  // Get last 6 digits of timestamp
  const timeComponent = timestamp % 1000000;

  // Get last 2 digits of user ID (ensures different numbers for different users)
  const userComponent = userId % 100;

  // Generate 2 random digits for extra uniqueness
  const randomComponent = Math.floor(Math.random() * 100);

  // Generate first digit (1-9)
  const firstDigit = Math.floor(Math.random() * 9) + 1;

  // Format each component to ensure correct length
  const formattedUser = userComponent.toString().padStart(2, '0');
  const formattedTime = timeComponent.toString().padStart(6, '0');
  const formattedRandom = randomComponent.toString().padStart(2, '0');

  return `${firstDigit}${formattedUser}${formattedTime}${formattedRandom}`;
}
