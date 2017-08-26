module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8546,
      network_id: "*" // Match any network id
    },
    ropsten: {
     network_id: 3,
     host: "localhost",
     port:  8545,
     gas:   4700000
    },
    main: {
     network_id: 1,
     host: "localhost",
     port:  8545,
     gas:   4700000
    },
  }
};
