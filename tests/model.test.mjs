import assert from 'node:assert/strict';
import test from 'node:test';
import {earlierDay,flowAt,juneRank} from '../web/model.mjs';
test('upstream offsets cross month boundaries in UTC and preserve missing values',()=>{
  assert.equal(earlierDay('2021-06-01',3),'2021-05-29');
  assert.equal(flowAt({'2021-05-29':0},'2021-06-01',3),0);
  assert.equal(flowAt({},'2021-06-01',3),null);
});

test('rank uses all thirty valid June observations and includes ties',()=>{
  const flow=Object.fromEntries(Array.from({length:30},(_,i)=>['2021-06-'+String(i+1).padStart(2,'0'),i<9?6970:7650]));
  assert.deepEqual(juneRank(flow,6970),{atOrBelow:9,total:30,percent:30});
  delete flow['2021-06-01'];
  assert.equal(juneRank(flow,6970),null);
});
