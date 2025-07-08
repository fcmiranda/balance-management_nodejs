/**
 * Generates a unique account number based on user ID and timestamp.
 * Format: [1-9][user_id_last_2][timestamp_last_6][random_1]
 * Example: For user 123 at timestamp ending in 553123 and random 4 -> 7235531234
 *
 * @param userId The ID of the user owning the account
 * @returns A unique 10-digit account number
 */
export function generateAccountNumber(userId: number): string {
  const timestamp = Date.now();

  const timeComponent = timestamp % 1000000;

  const userComponent = userId % 100;

  const randomComponent = Math.floor(Math.random() * 10);

  const firstDigit = Math.floor(Math.random() * 9) + 1;

  const formattedUser = userComponent.toString().padStart(2, '0');
  const formattedTime = timeComponent.toString().padStart(6, '0');

  return `${firstDigit}${formattedUser}${formattedTime}${randomComponent}`;
}
