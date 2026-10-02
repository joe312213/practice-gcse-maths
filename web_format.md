# Web format of the Maths starter

The maths starter began as a powerpoint based resource, with web answers.

To allow greater interactivity, animated demos of methods and features including progress tracking, gamification greater accessibility, the slide resources will be converted to a web format.

The existing content will be transferred.

Slides will initially be topic page sections, with navigation to treat each section as a 'slide'.

The website will borrow features from the T-Level starters site, at `https://jhudshcg.github.io/starters/` (repo: `https://github.com/jhudshcg/starters` ).

After studying these instructions, the T-Level starters site should be cloned and thoroughly reviewed, so that time can be saved by reusing the existing codebase or feature approaches where appropriate, while adapting it to the needs of the Maths starter.

The website will replace the slides as primary form of delivery. A slides export may be useful as a secondary form of delivery, but no ongoing effort should be expended on this, until specifically requested.

THe number of some types of questions from the slides will need expanding.

## Features to adapt from the T-Level starters

- progress tracking
- revision priority identification
- question sets and codes
- auto-marking of student answers
- question hints
- challenge levels
- customizable themes
- issue reporting
- activity timers
- incorporation of puzzles as alternative question types to maths exam based practice.

## Adapted feature differences and new terms

The progression of questions should by default be more structured for each topic, from initial assessment, technique demonstration, scaffolded practice, to independent practice of progressive challenge.

Challenge levels per topics should generally be 3: start, build, confidence.

Progress tracking should be keyed by username.

A naming scheme for question banks should be developed to denote subject, so that subject, so that the starter site can allow subject selection which then filters/selects the question banks to those relevant to the selected subject. This allows set codes to remain at 9 characters, while the starter site can in future support multiple subjects.

A 'question set', using the T-Level starters page term, now means a sequence of up to 3 question pages, activities or 'slides'. E.g. a page of straight method practice questions, a page of 'spot the error' questions, and a page of mixed practice questions, mixing revision priority topics, or questions using the method of the current topic, in a problem solving context. This will mean that the elements of the question set code no longer refer to individual questions, but question collections of a particular type and challenge level. (This could potentially be an idea to bring back to the T-Level starters site.)

Marking should take place on a question by question basis, not by page or question sets.

'Question set' should be renamed 'Practice set', since they now have different meaning from their previous use.

There are new meanings to 'question type' now. The old meaning is Exam practice vs Puzzles, etc. This should now be called 'Activity type'. The other meaning is question style within a type and topic. E.g. plain multiplication questions vs spot the error in method for multiplication questions vs problem solving using multiplication method. The main styles will be pain questions, spot the error, mixed priority, and problem solving using the method(s). The term 'Question type' or 'Question page type' should refer to this, for this project.


## Key features

### Challenge Level

- Challenge level of indepedent practice should automatically develop based on student performance.
    - Adaptabtion of question practice slides should broadly follow each slide column of questions being tagged with challenge level and topic. These questions can then be served in adaptive batches. E.g. 5 or 10 visible at a time, with the student able to select the one they want to do next. With a Question type page usually serving a total of 10 per attempt (some types could be less, e.g. 'spot the error' could be 3 or 4). Questions are marked immediately on submitting anwers, 1 question at a time.
        - Partial completition, including any working sketches, of questions is not retained if selected question is changed before submitting answer.
- Panel view of progress and performance, highlighting:
    - improvements, e.g. "well done, 3 question streak!"
    - success rate, for current topic as a percentage of correct answers, for the last 10 questions answered - at the current recommended challenge level for the topic.
        - Out of 10 questions the weighting should be x3 for the most recent last 3, x2 for the preceeding 2 and x1 for the preceeding 5 before that. So the total success 'score' is 9 + 4 + 5 = 18. The aim is to make the success % more responsive to recent performance. If a student gets the next 5 questions in a row correct, they will have 13/18 = 72.2% (yet unanswered questions of a set of 10 count for 0). 6 in a row correct would be 14/18 = 77.8%.
            - For shorter question pages with less than 10 questions, the percentage should be calculated from the total number of questions on the page. For 5 - 9 questions, weighting should be x2 for the most recent 3 questions. For 1 - 4 question length pages, even weighting. E.g.  3 out of 3, on a 3 question page, would be 100% on that challenge level.
        - If a student chooses to practice questions at a lower challenge level, after 2 such questions their current challenge level is reduced to that level (to avoid students 'gameing' the system by answering easier questions to get a promotion to higher challenge level - creating the appearance of progress)
- When topic answer success percentage rises beyond 75%, after a minimum of 5 questions completed in a Question page, challenge level of served questions should provisionally advance. With user notification of the change. E.g. "Congratulations! Try some more challenging questions." (if there are any remaining in the set) This means that provision advance can potentially occur before 10 questions are answered, given the above weighting.
    - If the remainder of the 10 questions at the new challenge level are answered correctly, with a minim of 2 questions, the challenge level is confirmed. If not, the challenge level is reverted to the previous level, with user notification of the change. If the user gets a higher challenge question wrong: "You have been returned to a lower challenge level for this topic. Keep practicing and you will be able to try again soon." If there were only 1 remaining question from the 10 it is answered correctly: " Well done, would you like to try more like this next time?" (let the user choose). If the user chooses to do so, challenge level promotion is made. If provisional promotion happens on last question, then: "Would you like to try some harder questions of this type next time?" If user answers yes, make the promotion.
    - If Question page type is set to show 10 questions and a provisional challenge level advance occurs, then the remaining questions of the 10 are changed to questions of a higher challenge level (with subtle visual identification of the change).
    - If a reversion happens within a 10 question page session, the user retains their previous success rate, but on the next page session of this type, topic and challenge level, a 5 question reassessment state (or less than 5, if the number of questions per page is < 10 ) will be used before a reattempt to a higher challenge level is allowed. Success percentage can be updated as usual during these reassesment state questions, but the challenge level will not be advanced until the those questions are completed and the success rate remains above 75%.
    - After reversion, no re-promotion is allowed on the same page for that page attempt, unless minimum 5 new questions in a row completed correctly (unlikely in a 10 question page after promotion and reversion)
    - If success percentage remains below 50% after at least 5 questions (or the number questions on a page, if less than 5) in a Question type page, a recommendation to drop down a level should be made.
    - If no reversion or promotion happens, students should retain their success % in future sessions for this Quesiton page type and topic.
    - If a question page type has less than 10 questions, then challenge level promotion must also be able to occur if all questions are answered correctly for pages with question numbers down to 3. For potential 1 and 2 question pages, a min of 3 questions must be answered correct, over different sessions or by option to answer another page of that type in the same session, to allow challenge level promotion.
- Students should be able to optionally advance their challenge level manually.
- Topic wide progress levels can be an amalgamation of progress levels for differe Question page types for that topic. With plain questions for the topic progress having a x2 weighting, with other topic Question types for the topic having a x1 weighting, for now.
    - Topic progress can be shown as a 3 (with perhaps a bonus 'extra' level, a V2 feature) stage bar, with each stage representing a challenge level.
- Success percentage is not increased if hints are used, or if the method reminder/demo is shown during the attempt on that question. (If the answer is wrong though, then success percentage is still decreased)

### Other features

- Progress tracking should be stored by username, still using browser local storage. When a user visits the site, if there is a username stored, the site should say "Welcome back, [username]!" where [username] is the last tracked username. There should be a 'Not you?' option to allow a new username to be entered, which will either switch to the recorded tracking for that user, or if not recognised, create a new profile. There should be a 'check for typos' first notice, and basic nearest match feature, to avoid a user with poor spelling creating multiple profiles. and losing progress tracking. This is not intended to be a secure login system, but a simple way to track progress for multiple users on the same device.
- The technique review slides for each topic should be adapted to include an animated demo of their application, in addition to the static worked example. Where possible, the demo should be interactive, allowing the student to input their own values and see the method applied to them. This could potentially be a v2 feature.
- There should be a drawing area for working out answers (touch device friendly), but with a text field for the final answer. For questions requiring working to be shown (most questions), there should be a simple check of the working area to see if it is blank, or minimally filled, and if so, a prompt to remind the student to show their working. This will not be fool proof, only a simple reminder to encourage good practice.
    - The working out drawing area should be in one place on the page and include the number next to it, for the question currently selected/being answered. When the next question is selected, the working area should, by default, clear and update to the new question number.
- Topic technique review should be available as a quick reference.
    - On smaller screen widths (< 768px), this should be a modal popup. On larger screens, it should be a side panel that can be toggled on/off. The review should include the worked example and animated demo. On larger screeens (>= 768px) it should turn a 1 col layout into 2 col, and a 2 col into a 3 col layout, with the review panel taking up the left hand side of the screen by default.
- configurable area on the main page to promote school/college related links/actions/groups. e.g. student voice, student intranet pages, etc. These should be figurable by json in a js file, so that the starter site can be used by multiple schools/colleges with different links and actions. Should support links, icons and QR codes. Should be able to be configured to show on the main page as a banner or popup, or on a separate page, or both.
- Regular question practice pages should usually entail 10 questions (with adaptive challenge level, as detailed above). This gives users a chance to progress without a single page attempt, creating an immeidate sense of reward/excitement.
    - When progressing through a Practice set with different Question page types, question challenge level should initially track the challenge level of the previous page of the Practice set. But each Question page type should allow its own challenge level for that topic and type. E.g. a student could do well with plain method practice questions but need more basic problem solving style questions until further practice.
    - Existing saved challenge levels should override session page progression inherritance.
- Subject selector, which is remembered by last user. this will select the appropriate subject coded question banks.

### Marking

Marking process should be clear and informative for the user.

Answer entry should be intuiative as far as possible.

#### Spot the error question type

One option to explore is: mixture of multiple choice for error types, whith fill in the blank spaces to exactly specify the values involved in the chosen error type.

### Feature deferments

V1 should have some animation of methods. Custom inputs to mathod application animations can be V2.

## Site content and structure

Similar to T-Level starters site, but maybe a bit simpler/more streamlined in look and feel.
