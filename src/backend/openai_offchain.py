from web3 import Web3
from eth_abi import abi as ethabi
from offchain_utils import gen_response, parse_req
from langchain import OpenAI, ConversationChain

# Initialize the OpenAI model
openai_model = OpenAI(model_name="gpt-4o")

def openai_create_question(ver, sk, src_addr, src_nonce, oo_nonce, payload, *args):
    print("OpenAI create_question")
    print("  -> offchain_openai handler called with ver={} subkey={} src_addr={} src_nonce={} oo_nonce={} payload={} extra_args={}".format(
        ver, sk, src_addr, src_nonce, oo_nonce, payload, args))
    err_code = 1
    resp = Web3.to_bytes(text="unknown error")
    assert(ver == "0.2")

    # Define the prompt for the chatbot
    prompt_template = """
    You are PresiBot, an intelligent assistant designed to simulate the role of the US President. Your task is to generate a single, thought-provoking question based on current political and economic scenarios.

    Consider the following background information:
    - Inflation in the US has recently decreased to 3.x%.
    - Student loans are getting remitted.
    - BRICS countries are buying significant amounts of gold and reducing their reliance on the US Dollar for trade.
    - The Moscow exchange has stopped trading the US Dollar.

    Generate a single, clear, and simple question that requires users to consider economic viability, short- and long-term consequences, political stability, and population popularity. The question should be easy for a general audience to understand.

    Your response should be only the question.
    """

    try:
      req = parse_req(sk, src_addr, src_nonce, oo_nonce, payload)

      # Prepare the prompt
      prompt = prompt_template

      # Create the conversation chain
      conversation = ConversationChain(llm=openai_model, verbose=True)

      # Generate a response from the model
      response = conversation.run(input=prompt)
      print("Open AI daily question:", response)
      resp = ethabi.encode(["string"], [response])
      err_code = 0
    except Exception as e:
        print("DECODE FAILED", e)

    return gen_response(req, err_code, resp)


def select_best_answer(ver, sk, src_addr, src_nonce, oo_nonce, payload, *args):
    print("OpenAI select_best_answer")
    print("  -> offchain_openai handler called with ver={} subkey={} src_addr={} src_nonce={} oo_nonce={} payload={} extra_args={}".format(
        ver, sk, src_addr, src_nonce, oo_nonce, payload, args))
    err_code = 1
    resp = Web3.to_bytes(text="unknown error")
    assert(ver == "0.2")

    # Define the prompt for the chatbot
    prompt_template = """
      You are an intelligent assistant designed to evaluate responses based on their quality. You are given a list of answers to a specific question. Your task is to determine which answer is the best based on economic viability, short- and long-term consequences, political stability, and population popularity.

      Consider the following answers and provide the index of the best answer (starting from 0):

      Question: {question}

      Answers:
      {answers}

      Provide only the index of the best answer.
    """

    try:
      req = parse_req(sk, src_addr, src_nonce, oo_nonce, payload)

      question = "How should the US respond to BRICS countries reducing their reliance on the US Dollar for trade?"
      answers = [
          "The US should focus on boosting its own economy through domestic policies and reducing its reliance on international trade.",
        "The US should increase diplomatic efforts to strengthen alliances and trade agreements with other countries.",
        "The US should implement sanctions against BRICS countries to deter them from reducing their reliance on the US Dollar.",
        "The US should invest in new technologies and industries to stay competitive in the global market."
      ]

      # Format the answers as a list string
      answers_list = "\n".join([f"{i}. {answer}" for i, answer in enumerate(answers)])

      # Prepare the prompt
      prompt = prompt_template.format(question=question, answers=answers_list)

      # Create the conversation chain
      conversation = ConversationChain(llm=openai_model, verbose=True)

      # Generate the index of the best answer from the model
      best_answer_index = conversation.run(input=prompt)

      index = best_answer_index.strip()
      print("Daily Question {} - Best Answer {}".format(question, answers[int(index)]))
      resp = ethabi.encode(["uint256"], [int(index)])
      err_code = 0
    except Exception as e:
        print("DECODE FAILED", e)

    return gen_response(req, err_code, resp)