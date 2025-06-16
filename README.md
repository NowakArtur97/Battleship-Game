# Battleship-Game

## Table of Contents

- [General info](#general-info)
- [Features](#features)
- [Built With](#built-with)
- [Status](#status)

## General info

AWS CloudFormation template for creating resources for a static website on an S3 bucket with a battleship game and a backend server to handle communication using websockets.

## Features

Battleship Game:

- Playing against an AI opponent
- Playing against another player
- Joining another player's game
- Checking if the game exists when trying to join a game
- Informing when an opponent leaves the game

CloudFormation:

- Creating a static page on S3 with battleship game
- Automatic copying of website files from the GitHub repository to the S3 bucket
- Automatic cleaning of the S3 bucket after deleting a CloudFormation template
- Collecting logs from the lambda functions
- Creating the infrastructure needed to run an EC2 instance with a backend server
- Automatic configuration of Docker on EC2 instance
- Running a Docker image on an EC2 instance with a backend server application

## Built With

Backend build with:

- Java 21
- Spring - 3.4.5
- Websockets
- Maven
- Docker
- Cloudformation

CloudFormation resources:

- S3 Bucket
- Bucket Policy
- IAM Roles
- Lambda Functions
- CloudFormation Custom Resources
- VPC
- Internet Gateway
- VPC Gateway Attachment
- Route Table
- Route
- Subnet Route Table Association
- Subnet
- Security Group
- EC2 Instance

## Status

Project is: finished
