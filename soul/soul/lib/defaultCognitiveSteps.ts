import {
  ChatMessageRoleEnum,
  WorkingMemory,
  createCognitiveStep,
  indentNicely,
  stripEntityAndVerb,
  stripEntityAndVerbFromStream,
  z,
} from "@opensouls/engine";

export const externalDialog = createCognitiveStep((instructions: string | { instructions: string; verb: string }) => {
  let instructionString: string, verb: string;
  if (typeof instructions === "string") {
    instructionString = instructions;
    verb = "said";
  } else {
    instructionString = instructions.instructions;
    verb = instructions.verb;
  }
  return {
    command: ({ soulName: name }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        name: name,
        content: indentNicely`
            Model the mind of ${name}.
    
            ## Instructions
            * DO NOT include actions (for example, do NOT add non-verbal items like *John Smiles* or *John Nods*, etc).
            * DO NOT include internal thoughts (for example, do NOT respond with John thought: "...").
            * If necessary, use all CAPS to emphasize certain words.
    
            ${instructionString}
    
            Please reply with ONLY the next utterance from ${name} (no other content).
          `,
      };
    },
    streamProcessor: stripEntityAndVerbFromStream,
    postProcess: async (memory: WorkingMemory, response: string) => {
      const stripped = stripEntityAndVerb(memory.soulName, verb, response);

      const newMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: `${memory.soulName} ${verb}: "${stripped}"`,
      };
      return [newMemory, stripped];
    },
  };
});

export const internalMonologue = createCognitiveStep(
  (instructions: string | { instructions: string; verb: string }) => {
    let instructionString: string, verb: string;
    if (typeof instructions === "string") {
      instructionString = instructions;
      verb = "thought";
    } else {
      instructionString = instructions.instructions;
      verb = instructions.verb;
    }

    return {
      command: ({ soulName: name }: WorkingMemory) => {
        return {
          role: ChatMessageRoleEnum.System,
          name: name,
          content: indentNicely`
          ${name} ${verb} internally.

          ## Description
          ${instructionString}

          ## Rules
          * Internal monologue thoughts should match the speaking style of ${name}.
          * Respond *only* with the internal monologue, etc
          * Follow the Description when creating the internal thought!

          Please reply with ONLY the next internal monologue thought of ${name} (no other content).
        `,
        };
      },
      streamProcessor: stripEntityAndVerbFromStream,
      postProcess: async (memory: WorkingMemory, response: string) => {
        const stripped = stripEntityAndVerb(memory.soulName, verb, response);
        const newMemory = {
          role: ChatMessageRoleEnum.Assistant,
          content: `${memory.soulName} ${verb}: "${stripped}"`,
        };
        return [newMemory, stripped];
      },
    };
  }
);

export const decision = createCognitiveStep(
  ({
    description,
    choices,
    verb = "decided",
  }: {
    description: string;
    choices: z.EnumLike | string[];
    verb?: string;
  }) => {
    const params = z.object({
      decision: z.string().describe(`The decision made by the entity.`),
    });
    return {
      schema: params,
      command: ({ soulName: name }: WorkingMemory) => {
        return {
          role: ChatMessageRoleEnum.System,
          name: name,
          content: indentNicely`
          ${name} is deciding between the following options:
          ${Array.isArray(choices) ? choices.map((c) => `* ${c}`).join("\n") : JSON.stringify(choices, null, 2)}

          ## Description
          ${description}

          ## Rules
          * ${name} must decide on one of the options. Return ${name}'s decision.
        `,
        };
      },
      streamProcessor: stripEntityAndVerbFromStream,
      postProcess: async (memory: WorkingMemory, response: z.infer<typeof params>) => {
        const stripped = stripEntityAndVerb(memory.soulName, verb, response.decision);
        const newMemory = {
          role: ChatMessageRoleEnum.Assistant,
          content: `${memory.soulName} ${verb}: "${stripped}"`,
        };
        return [newMemory, stripped];
      },
    };
  }
);

export const mentalQuery = createCognitiveStep((statement: string) => {
  const params = z.object({
    isStatementTrue: z.boolean().describe(`Is the statement true or false?`),
  });

  return {
    command: ({ soulName: name }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        name: name,
        content: indentNicely`
          ${name} reasons about the veracity of the following statement.
          > ${statement}

          Please reply with if ${name} believes the statement is true or false.
        `,
      };
    },
    schema: params,
    postProcess: async (memory: WorkingMemory, response: z.output<typeof params>) => {
      const newMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: `${memory.soulName} evaluated: \`${statement}\` and decided that the statement is ${
          response.isStatementTrue ? "true" : "false"
        }`,
      };
      return [newMemory, response.isStatementTrue];
    },
  };
});

export const instruction = createCognitiveStep((instructions: string) => {
  return {
    command: ({ soulName }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        name: soulName,
        content: instructions,
      };
    },
  };
});
