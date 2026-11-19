export function earlierDay(day, lag) {
  const time = new Date(day + 'T00:00:00Z');
  time.setUTCDate(time.getUTCDate() - lag);
  return time.toISOString().slice(0, 10);
}
export function flowAt(flows, date, lag) {
  return flows[earlierDay(date, lag)] ?? null;
}

export function juneRank(flows, value) {
  if (!Number.isFinite(value)) return null;
  const reference = Array.from(
    { length: 30 },
    (_, index) => flows['2021-06-' + String(index + 1).padStart(2, '0')],
  );
  if (!reference.every(Number.isFinite)) return null;
  const atOrBelow = reference.filter((discharge) => discharge <= value).length;
  return {
    atOrBelow,
    total: reference.length,
    percent: Math.round((100 * atOrBelow) / reference.length),
  };
}

export const sceneNotes = {
  b1fbdc7a78b99ad3b16ef9d6a7f89e5ec79fee75891626b3552746d13946ac11:
    'Scattered cloud covers parts of the northeast coast. A tan band extends west from the river mouth into greener water.',
  cf84443ef31df8242681aa0a3c23e4fa52b81848ab7bc9a6eff87b06198a9f83:
    'Thick cloud covers the delta and most of the strait. Only a narrow strip of water is visible at the western edge.',
  '355e69ac0c955ce800f8527ce1558ad9ecc7d3946dfb79dd135af4ceedf2df3d':
    'The river mouth and nearby water are visible. A green-brown band follows the coast, with darker water farther west and wisps near the southwest edge.',
  '2607cdcc81529bd95723ec1d282423f1d3126a7f7039984b353f0a9004374bfb':
    'The delta and strait are largely unobscured. A broad patch of lighter green water curves southwest from the coast.',
};
