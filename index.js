var PROTO_PATH = __dirname+'/greeter.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });


var greeter_proto =
    grpc.loadPackageDefinition(packageDefinition).greeter; 


function lotsOfReplies(call) {
  console.log("Request:"+call.request);
    var name = call.request.name
    for(let i=0;i<10;++i){
      call.write({message: "Yo "+name+" "+i});
    }
    call.end();
}

function sayHello(call, callback) {
  callback(null, {message: 'Yo ' + call.request.name});
}

function lotsOfRequests(call, callback) {
  var input = [];
  var index = 0;
  call.on('data',function(request){
    console.log("Request:"+request.name);
    input.push("Hello "+request.name+" "+index+"\n");
    index++;
  });
  call.on('end',function(){
    callback(null, {message: input.toString()});
  });
}

function bidirectionalHello(call) {
  var input = [];
  var index = 0;
  call.on('data',function(request){
    console.log("Request: "+request.name);
    if(index < 2){
      call.write({message: "Hello "+request.name+" "+(index*2)});
    }
    else{
      call.write({message: "Yo "+request.name+" "+(index*3)});
    }
    
    input.push(request.name+"\n");
    index++;
  });
  call.on('end',function(){
    call.write({message: "\n"+input.toString()+" "+(index*index)});
    call.end();
  });
}

function main() {
  var server = new grpc.Server();
  server.addService(greeter_proto.Greeter.service, {
    sayHello: sayHello,
    lotsOfReplies: lotsOfReplies,
    lotsOfRequests: lotsOfRequests,
    bidirectionalHello: bidirectionalHello
  });

  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
}

main();