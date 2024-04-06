import { preparePostRequest } from "@/util/request-helper";
import { QuestionResType } from "@/components/variables-types";

export async function bedRockSync(prompt: string) {
  const bedrock_sync_url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL_SERVICE}/${process.env.NEXT_PUBLIC_STAGE}/bedrock/synchronous`);
  const fullPrompt = "Human: " + prompt + "\n Assistant:";
  const bodyParams: any = {
    modelId: "anthropic.claude-instant-v1",
    body: {
      prompt: fullPrompt,
      max_tokens_to_sample: 300,
      temperature: 1,
      top_k: 250,
      top_p: 0.999,
      stop_sequences: [],
      anthropic_version: "bedrock-2023-05-31",
    },
  };
  const requestParams = preparePostRequest(JSON.stringify(bodyParams));
  const response = await fetch(bedrock_sync_url, requestParams);
  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message);
  }
  if (res.error) {
    throw new Error(res.message);
  }
  return res.completion.trim();
}

export async function bedRockStream(prompt: string) {
  let result = "";
  const fullPrompt = "Human: " + prompt + "\n Assistant:";
  const bedrock_streaming_url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL_SERVICE}/${process.env.NEXT_PUBLIC_STAGE}/bedrock/streaming`);
  const bodyParams: any = {
    requestType: "bedrockService",
    body: {
      tenantId: "1553582c-8c92-46d0-8bec-b4c113d304b5",
      modelId: "anthropic.claude-instant-v1",
      body: {
        prompt: fullPrompt,
        max_tokens_to_sample: 300,
        temperature: 1,
        top_k: 250,
        top_p: 0.999,
        stop_sequences: [],
        anthropic_version: "bedrock-2023-05-31",
      },
    },
  };

  const requestParams = preparePostRequest(JSON.stringify(bodyParams));
  const response = await fetch(bedrock_streaming_url, requestParams);
  if (response.body) {
    const reader = response.body.getReader();
    let res = "";
    let chunk;
    let resString = "";

    while (!(chunk = await reader.read()).done) {
      const chunkText = new TextDecoder().decode(chunk.value);
      res += chunkText;
      let startIndex = res.indexOf("{");
      let endIndex = res.lastIndexOf("}");
      if (startIndex !== -1 && endIndex !== -1) {
        if (startIndex < endIndex) {
          try {
            resString = res.substring(startIndex, endIndex + 1);
          } catch (error) {
            console.error("Error:", error);
            result = "Unable to provide the correct response.";
          }
        }
      }
      if (resString.trim() !== "") {
        try {
          const delimitedString = resString.replace(/}{/g, "},{");
          const jsonArrayString = `[${delimitedString}]`;
          const jsonArray = JSON.parse(jsonArrayString);
          jsonArray.forEach((item: any) => {
            result += item.completion + " ";
          });
        } catch (error) {
          console.error("Delimiting string failed:", error);
          result = "Unable to provide the correct response.";
        }
      }
    }
  }
  return result.trim();
}

export async function conversation(question: string, chatHistory: Array<QuestionResType>) {
  const bedrock_sync_url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL_CHATPVT}/${process.env.NEXT_PUBLIC_STAGE}/chatpvt/conversation`);
  const bodyParams =
    chatHistory.length === 0
      ? {
          CollectionName: "chatpvtdocs",
          Question: question,
        }
      : {
          CollectionName: "chatpvtdocs",
          Question: question,
          ChatHistory: chatHistory,
        };

  console.log("!!!!====bodyParams:", bodyParams);
  const requestParams = preparePostRequest(JSON.stringify(bodyParams));
  const response = await fetch(bedrock_sync_url, requestParams);
  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.message);
  }
  if (res.error) {
    throw new Error(res.message);
  }
  return res;
}
