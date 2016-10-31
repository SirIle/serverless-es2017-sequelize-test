# Serverless demo

After cloning the project, the needed packages can be installed with
`npm install`.

Serverless framework needs to be installed. It can be done with `npm install -g
serverless`.

## Building and transpiling

As the code is ES2017 it needs to be transpiled before it can be run on Lambda
which only supports nodejs 4.3. Transpiling can be done either by the editor and
a suitable plugin (like Atom and Babel-plugin) or with `npm run transpile`.
Babel can also be set to run in a watch mode to keep development cycle lean if
editor transpiling isn't used. The tasks *local* and *remote* call transpile
before executing the function.

If the transpiling fails, be sure that you have run `npm install` so that the
Babel files are installed locally. When deploying, the directories are pruned
so that you need to install the dependencies again.

## Running locally

This example uses the Docker for Mac setup. Getting it to run on Docker for
Windows or on top of Docker Machine may require minor tweaks and contributions
are  welcome.

### Start local database and enter test data

This command will also create a local network called *lambda* and join the
created database there. The test data is located in *testdata* folder as JSON.

~~~bash
npm run localdb
~~~

Re-synching the database tables and reinserting testdata can be done with `npm
run resetlocaldb`.

### Run the function and connect to the local database

~~~bash
npm run local -- '{"path":{"userid":"user1"}}'
~~~

### Run the function and connect to the remote database

~~~bash
npm run remote -- '{"path":{"userid":"user1"}}'
~~~

### Running tests

The test setup first starts the local database instance and transpiles so that
everything should be up to date. After that it executes the tests in the
*test* folder. It runs the local Docker based instance of the function against
the local database. The tests can be run with

~~~bash
npm test
~~~

## Running on AWS Lambda

### Prerequisites

#### AWS account

The AWS account needs to be usable and preferably aws-cli configured so that
connection to AWS account is established. Information about setting up the
account and configuring the aws-cli can be found [here](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-set-up.html).

#### Database on AWS RDS

The database needs to be set-up on AWS RDS. This can be done through the AWS
console. To be able to access the database from outside of the Lambda functions
the database needs to have the option *publicly accessible* set. The public
address of the database is displayed as the endpoint.

#### VPC and role configuration

The database needs to be in the same VPC as the Lambda function. I created a new
VPC called *Lambda and DB*. The security group needs to allow access to the
database port 3306 from the address that you're using. The security group
information can be found from the database configuration details on the AWS RDS
page. Adding a name-tag to the security group makes it easily findable later.
Your current address can be added to the allowed addresses with the command

~~~bash
aws ec2 authorize-security-group-ingress --group-id <sg-group-id> --protocol tcp --port 3306 --cidr $(curl checkip.amazonaws.com)/32
~~~

#### Setting up the database

Now you can use a sql editor (or command line management tools) to connect to
the DB instance and create a database. I use [Sequel
Pro](https://www.sequelpro.com/). The example uses a database name "ile" but it
can be whatever, just make sure to configure it correctly in the
*config/sequelize.json* along with the database URL.

#### Inserting test data to the database

After the configuration is done and the database created, the test data can be
synchronized with

~~~bash
npm run resetremotedb
~~~

### Prune the folder to prevent extra packages being exported and deploy

~~~bash
npm run deploy
~~~

For local development some of the packages might be needed, they can be
reinstalled with `npm install`.

## Setting the VPC and permissions to the Lambda function

After deployment the VPC needs to be configured for the function so that it can
connect to the database. This can be done through the AWS Lambda console.
Select the function and go under *configuration* and *advanced settings*. There
you can select the previously created VPC and set the security group as well.

The role with the function name and ending with *IamRoleLambdaExecution* has
been created. Now an execution policy needs to be attached to that role so that
it can call the database in the VPC. This can be done through the *IAM* service
in the console. Select the role and attach the *AWSLambdaVPCAccessExecutionRole*
policy to it.

## Testing the created function

Now everything should be set-up so that the created function can be called. When
the function was installed, an endpoint was created for it and was displayed.
The information can also be shown with the command `serverless info`.

~~~bash
$ serverless info

Service Information
service: serverless-es2017-sequelize-test
stage: dev
region: eu-central-1
api keys:
  None
endpoints:
  GET - https://<redacted>.execute-api.eu-central-1.amazonaws.com/dev/users/{userid}
functions:
  serverless-es2017-sequelize-test-dev-users: arn:aws:lambda:eu-central-1:<redacted>:function:serverless-es2017-sequelize-test-dev-users
~~~

Now the function can be called with

~~~bash
$ curl https://<redacted>.execute-api.eu-central-1.amazonaws.com/dev/users/user1
{"id":1,"userid":"user1","firstname":"Ilkka","lastname":"Anttonen","age":30,"createdAt":"2016-10-27T21:25:59.000Z","updatedAt":"2016-10-27T21:25:59.000Z","addresses":[{"id":1,"streetaddress":"Someroad 1 A","zipcode":"12345","createdAt":"2016-10-27T21:26:00.000Z","updatedAt":"2016-10-27T21:26:00.000Z","userId":1},{"id":2,"streetaddress":"Olderroad 2","zipcode":"23456","createdAt":"2016-10-27T21:26:00.000Z","updatedAt":"2016-10-27T21:26:00.000Z","userId":1}]}
~~~

## Known issues

When calling the external database from the Docker based local function, the
call takes about 11 seconds as the local instance doesn't return the result
straight after calling the callback. When using a Docker based database instance
this doesn't happen. I haven't debugged this in depth, but if anyone has ideas
why this is happening, please suggest a fix.

## Next steps

Now the function should be callable and can easily be updated after testing the
changes locally. Next a UI can be added on top and this is done in another
project, *frontend-es2017-react-sequelize-test*.
