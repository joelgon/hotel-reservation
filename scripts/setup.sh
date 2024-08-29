#!/bin/bash

MONGODB1=mongo1
MONGODB2=mongo2
MONGODB3=mongo3

echo "**********************************************" ${MONGODB1}
echo "Waiting for startup.."

# Função para verificar se o MongoDB está pronto
function wait_for_mongo() {
  local host=$1
  until mongosh --host ${host} --eval "db.runCommand({ ping: 1 })" &>/dev/null; do
    printf '.'
    sleep 1
  done
  echo " MongoDB at ${host} is up."
}

# Espera o MongoDB inicializar
wait_for_mongo ${MONGODB1}:27017
wait_for_mongo ${MONGODB2}:27017
wait_for_mongo ${MONGODB3}:27017

echo "SETUP.sh time now: $(date +"%T")"

mongosh --host ${MONGODB1}:27017 <<EOF
var cfg = {
    "_id": "rs0",
    "version": 1,
    "members": [
        { "_id": 0, "host": "${MONGODB1}:27017", "priority": 2 },
        { "_id": 1, "host": "${MONGODB2}:27017", "priority": 0 },
        { "_id": 2, "host": "${MONGODB3}:27017", "priority": 0 }
    ]
};

try {
    var status = rs.status();
    if (status.ok === 0) {
        print("Initiating Replica Set...");
        rs.initiate(cfg);
    } else {
        print("Replica Set already initialized. Reconfiguring...");
        rs.reconfig(cfg, { force: true });
    }
} catch (e) {
    if (e.message.indexOf("no replset config has been received") >= 0) {
        print("Replica Set not yet initialized, initiating now...");
        rs.initiate(cfg);
    } else {
        print("Error during Replica Set initialization:");
        print(e);
    }
}

print("Setting read preference to 'primaryPreferred'...");
db.getMongo().setReadPref('primaryPreferred');

print("Replica Set configuration complete.");

EOF

echo "Replica Set setup completed successfully."
