import os.path
import boto3
import cfnresponse

BUCKETS_TO_CLEAN = os.environ['BUCKETS_TO_CLEAN'].split(",")

s3 = boto3.resource('s3')

def clear_bucket(bucketName):
    s3.Bucket(bucketName).objects.all().delete()

def lambda_handler(event, context):
    responseData = {}
    if event['RequestType'] == 'Delete':
        for bucketName in BUCKETS_TO_CLEAN:
            try:
                clear_bucket(bucketName)
                print("Successfully cleared bucket: " + bucketName)
                cfnresponse.send(event, context, cfnresponse.SUCCESS, responseData)
            except Exception as e:
                print('Exception when cleaning bucket: ' + bucketName)
                print(e)
                cfnresponse.send(event, context, cfnresponse.FAILED, responseData)
    else:
        cfnresponse.send(event, context, cfnresponse.SUCCESS, responseData)