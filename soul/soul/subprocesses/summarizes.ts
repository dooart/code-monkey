import {
  ChatMessageRoleEnum,
  MentalProcess,
  WorkingMemory,
  createCognitiveStep,
  indentNicely,
  useActions,
  useProcessMemory,
} from "@opensouls/engine";
import { internalMonologue } from "../lib/defaultCognitiveSteps.js";

const conversationNotes = createCognitiveStep((existing: string) => {
  return {
    command: ({ soulName: name }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        content: indentNicely`
          ## Existing notes
          ${existing}

          ## Description
          Write an updated and clear paragraph describing the conversation so far.
          Make sure to keep details that ${name} would want to remember.

          ## Rules
          * Keep descriptions as a paragraph
          * Keep relevant information from before
          * Use abbreviated language to keep the notes short
          * Make sure to detail the motivation of ${name} (what are they trying to accomplish, what have they done so far).

          Please reply with the updated notes on the conversation:
        `,
      };
    },
  };
});

const summarizesConversation: MentalProcess = async ({ workingMemory }) => {
  const conversationModel = useProcessMemory(
    `${workingMemory.soulName} is talking to one or more people and trying to learn as much as possible about them.`
  );
  const { log: engineLog } = useActions();
  const log = (...args: any[]) => {
    engineLog("[summarizes]", ...args);
  };

  if (workingMemory.memories.length <= 15) {
    return workingMemory;
  }

  let memory = workingMemory;

  log("Updating conversation notes");
  [memory] = await internalMonologue(memory, {
    instructions: "What have I learned in this conversation.",
    verb: "noted",
  });

  const [, updatedNotes] = await conversationNotes(memory, conversationModel.current);
  conversationModel.current = updatedNotes as string;

  return workingMemory
    .slice(0, 1)
    .withMemory({
      role: ChatMessageRoleEnum.Assistant,
      content: indentNicely`
      ## Conversation so far
      ${updatedNotes}
    `,
      metadata: {
        conversationSummary: true,
      },
    })
    .concat(workingMemory.slice(-8));
};

export default summarizesConversation;
