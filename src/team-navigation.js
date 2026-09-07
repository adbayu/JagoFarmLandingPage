export function adjacentTeamIndex(index, direction, length) {
  return (index + direction + length) % length;
}
