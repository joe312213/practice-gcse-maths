/** Build homepage previews from the same authored banks used by practice. No complete banks enter homepage client data. */
import { foundationTopics, topicPath } from '#lib/content/topic-routes.mjs';
import multiplication from '../../static/data/multiplication.json' with { type: 'json' };
import division from '../../static/data/division.json' with { type: 'json' };
import equations from '../../static/data/equations.json' with { type: 'json' };
const banks = { multiplication, division, equations };
export function load() {
  return {
    topics: foundationTopics.map((topic) => {
      const bank = banks[topic.file];
      const example = bank.questions.find(
        (question) => question.type === 'demo' && question.level === 1,
      );
      if (!example) throw Error(`Missing Build example for ${topic.bank}`);
      return { title: bank.title, path: topicPath(topic.bank), example };
    }),
  };
}
