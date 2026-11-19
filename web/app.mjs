import { el, fmt, options, source, table, start } from './ui.mjs';
import { earlierDay, flowAt, juneRank, sceneNotes } from './model.mjs';
start((data) => {
  const choices = data.scenes.map((s) => [s.date, s.date]);
  options('left', choices, '2021-06-21');
  options('right', choices, '2021-06-28');
  options('lag', [
    [0, 'Same day'],
    [1, '1 day earlier'],
    [2, '2 days earlier'],
    [3, '3 days earlier'],
    [7, '7 days earlier'],
  ]);
  source('gauge', data.gauge);
  function update() {
    const lag = Number(el('lag').value),
      dates = [el('left').value, el('right').value];
    const figs = dates.map((day) => {
      const s = data.scenes.find((row) => row.date === day),
        figure = document.createElement('figure');
      const title = document.createElement('h3');
      title.textContent = day;
      const img = document.createElement('img');
      img.src = './data/' + s.image;
      img.className = 'scene';
      img.width = 680;
      img.height = 615;
      img.alt =
        'NASA Terra true-colour view of the Fraser delta and the adjacent Strait of Georgia on ' +
        day;
      const cap = document.createElement('figcaption'),
        link = document.createElement('a');
      const amount = flowAt(data.flow, day, lag);
      cap.append(
        'Hope, ' + earlierDay(day, lag) + ' · ' + fmt(amount, 0) + ' m³/s · ',
      );
      link.href = s.source;
      link.textContent = 'NASA image ↗';
      cap.append(link);
      const rank = juneRank(data.flow, amount);
      if (rank) {
        const detail = document.createElement('p');
        detail.textContent =
          'June flow rank: ' +
          rank.atOrBelow +
          ' of ' +
          rank.total +
          ' days at or below this discharge (' +
          rank.percent +
          '%).';
        cap.append(detail);
      }
      if (sceneNotes[s.sha256]) {
        const note = document.createElement('p');
        note.textContent = sceneNotes[s.sha256];
        cap.append(note);
      }
      figure.append(title, img, cap);
      return figure;
    });
    el('scenes').replaceChildren(...figs);
    const a = flowAt(data.flow, dates[0], lag),
      b = flowAt(data.flow, dates[1], lag);
    el('result').textContent =
      a == null || b == null
        ? 'Flow unavailable for this offset'
        : a === b
          ? 'Both selected gauge days averaged ' + fmt(a, 0) + ' m³/s.'
          : 'On the right-hand gauge date the river carried ' +
            fmt(Math.abs(b - a), 0) +
            ' m³/s ' +
            (b > a ? 'more.' : 'less.');
    const comparisons = Array.from(el('lag').options, option => {
      const days = Number(option.value);
      const left = flowAt(data.flow, dates[0], days);
      const right = flowAt(data.flow, dates[1], days);
      return {label: option.text, left, right, change: left == null || right == null ? null : right - left};
    });
    const changes = comparisons.map(row => row.change).filter(Number.isFinite);
    let conclusion = 'Some offsets lack comparable observations.';
    if (dates[0] === dates[1]) conclusion = 'Choose two different image dates to compare the flows.';
    else if (changes.length === comparisons.length) {
      if (Math.min(...changes) < 0 && Math.max(...changes) > 0) conclusion = 'Which image has the higher upstream flow reverses when you change the assumed travel time.';
      else if (changes.every(change => change === 0)) conclusion = 'Both gauge days have equal discharge at every tested offset.';
      else {
        const side = changes.some(change => change > 0) ? 'right' : 'left';
        conclusion = 'The ' + side + '-hand gauge day has ' +
          (changes.includes(0) ? 'equal or higher flow' : 'higher flow') + ' at all five tested offsets.';
      }
    }
    el('lag-conclusion').textContent = conclusion;
    table('sensitivity', ['Gauge timing', 'Left flow (m³/s)', 'Right flow (m³/s)', 'Right minus left (m³/s)'],
      comparisons.map(row => [row.label, fmt(row.left, 0), fmt(row.right, 0),
        row.change === null ? 'Unavailable' : (row.change > 0 ? '+' : '') + fmt(row.change, 0)]));
    table(
      'rows',
      ['Scene date', 'Gauge date', 'Discharge (m³/s)', 'June days at or below'],
      data.scenes.map((s) => {
        const amount = flowAt(data.flow, s.date, lag),
          rank = juneRank(data.flow, amount);
        return [
          s.date,
          earlierDay(s.date, lag),
          fmt(amount, 0),
          rank
            ? rank.atOrBelow + ' / ' + rank.total + ' (' + rank.percent + '%)'
            : 'Unavailable',
        ];
      }),
    );
  }
  for (const id of ['lag', 'left', 'right']) el(id).onchange = update;
  el('swap').onclick = () => {
    [el('left').value, el('right').value] = [
      el('right').value,
      el('left').value,
    ];
    update();
  };
  update();
});
