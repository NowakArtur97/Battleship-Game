import os
import urllib.request
import boto3
from urllib.parse import urlparse
import cfnresponse

s3 = boto3.resource('s3')
BUCKET_NAME = os.environ['BUCKET_NAME']
GITHUB_URL = os.environ['GITHUB_URL']
FILES_TO_COPY = os.environ['FILES_TO_COPY'].split(",")

def save_to_local(url):
    urlPath = urlparse(url).path
    fileName = os.path.basename(urlPath)
    filePath = '/tmp/' + fileName
    urllib.request.urlretrieve(url, filePath)
    return filePath

def copy_to_s3(url, folder, contentType):
    filePath = save_to_local(url)
    fileName = os.path.basename(filePath)
    s3.Object(BUCKET_NAME, folder + fileName).put(Body=open(filePath, 'rb'), ContentType=contentType)

def resolve_content_type(file):
    extension = file.split(".")[1]
    if extension == "html":
        return "text/html"
    elif extension == "css":
        return "text/css"
    elif extension == "js":
        return "text/javascript"
    elif extension == "py":
        return "text/x-python"
    elif extension in ["jpeg", "jpg"]:
        return "image/jpeg"
    elif extension == "png":
        return "image/png"
    elif extension == "tiff":
        return "image/tiff"
    elif extension == "bmp":
        return "image/bmp"
    elif extension == "gif":
        return "image/gif"
    elif extension in ["svg", "xml"]:
        return "image/svg+xml"
    elif extension in ["mp3", "wav", "ogg"]:
        return "audio/mpeg"
    elif extension == "pdf":
        return "application/pdf"
    elif extension == "zip":
        return "application/zip"
    elif extension == "yaml":
        return "binary/octet-stream"
    else:
        return "text/plain"

def lambda_handler(event, context):
    responseData = {}
    requestType = event['RequestType']
    try:
        if requestType == 'Create':
            for fileToCopy in FILES_TO_COPY:
                fileOnGitHub = GITHUB_URL + "/" + fileToCopy
                print("File to copy: " + fileToCopy)
                print("URL to file: " + fileOnGitHub)
                folder = fileToCopy[:fileToCopy.rfind("/")] + '/' if '/' in fileToCopy else ''
                contentType = resolve_content_type(fileToCopy)
                copy_to_s3(fileOnGitHub, folder, contentType)
                print("Successfully copied file: " + fileToCopy + " to bucket: " + BUCKET_NAME)
        cfnresponse.send(event, context, cfnresponse.SUCCESS, responseData)
    except Exception as e:
        print("Exception when copying files from GitHub to S3 bucket: " + BUCKET_NAME)
        print(e)
        cfnresponse.send(event, context, cfnresponse.FAILED, responseData)