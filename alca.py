from ibm_watson import AssistantV2
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import os
from dotenv import load_dotenv

env_path = '.env.local'
load_dotenv(dotenv_path=env_path)

authenticator = IAMAuthenticator(os.getenv("API_KEY"))
assistant = AssistantV2(
    version=os.getenv("VERSION"),
    authenticator=authenticator
)
assistant.set_service_url(os.getenv("SERVICE_URL"))

session_response = assistant.create_session(assistant_id=os.getenv("ASSISTANT_ID")).get_result()
session_id = session_response['session_id']

def send_message_to_watson(message, session_id):
    response = assistant.message(
        assistant_id=os.getenv("ASSISTANT_ID"),
        session_id=session_id,
        input={
            'message_type': 'text',
            'text': message
        }
    ).get_result()
    return response

def main():
    try:
        while True:
            user_input = input("You: ")
            if user_input.lower() == 'quit':
                break
            response = send_message_to_watson(user_input, session_id)
            generic_responses = response['output']['generic']
            for item in generic_responses:
                if item['response_type'] == 'text':
                    print("Watson: ", item['text'])
                elif item['response_type'] == 'option':
                    print(item['title'])
                    for option in item['options']:
                        print(f"- {option['label']}")
    finally:
        assistant.delete_session(
            assistant_id=os.getenv("ASSISTANT_ID"),
            session_id=session_id
        )

if __name__ == "__main__":
    main()
