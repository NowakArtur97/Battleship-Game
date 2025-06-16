import os
import cfnresponse
import boto3

FILE_NAME = os.environ['FILE_NAME']
BUCKET_NAME = os.environ['BUCKET_NAME']
VALUES_TO_REPLACE = os.environ['VALUES_TO_REPLACE'].split(",")
VALUES_TO_BE_REPLACED = os.environ['VALUES_TO_BE_REPLACED'].split(",")

TMP_FILE_PATH = '/tmp/' + FILE_NAME

s3 = boto3.resource('s3')

def download_file():
  bucket = s3.Bucket(BUCKET_NAME)
  bucket.download_file(FILE_NAME, TMP_FILE_PATH)

def read_file():
    with open(TMP_FILE_PATH, 'r') as file:
      filedata = file.read()
    return filedata

def reaplce_values_in_file(filedata):
    for index, toReplace in enumerate(VALUES_TO_REPLACE):
      toBeReplaced = VALUES_TO_BE_REPLACED[index]
      filedata = filedata.replace(toReplace, toBeReplaced)
      print("Changed value from: " + toReplace + " to: " + toBeReplaced + " in file: " + FILE_NAME)
    return filedata

def save_new_values_to_file(filedata):
    with open(TMP_FILE_PATH, 'w') as file:
      file.write(filedata)

def upload_updated_file_to_s3():
    s3.Object(BUCKET_NAME, FILE_NAME).put(Body=open(TMP_FILE_PATH, 'rb').read())

def lambda_handler(event, context):
    responseData = {}
    requestType = event['RequestType']
    try:
      if requestType == 'Create':
        download_file()
        filedata = read_file()
        filedata = reaplce_values_in_file(filedata)
        save_new_values_to_file(filedata)
        upload_updated_file_to_s3()
        print("Successfully updated file: " + FILE_NAME + " in bucket: " + BUCKET_NAME)
      cfnresponse.send(event, context, cfnresponse.SUCCESS, responseData)
    except Exception as e:
      print("Exception when updated file: " + FILE_NAME + " in bucket: " + BUCKET_NAME)
      print(e)
      cfnresponse.send(event, context, cfnresponse.FAILED, responseData)