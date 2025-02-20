type TApplicationConfig = {
  port: number | undefined,
  username: string | undefined,
  password: string | undefined,
  dbUri: string | undefined,
} 


const configObject: {[key:string]: TApplicationConfig} = {
  "development": {
    port: 3000,
    username: "dmsosa",
    password: "pepeeselmejor",
    dbUri: "mongodb://localhost:27017/developmentPortfolio",
    },
  "test": {
    port: 3000,
    username: "dmsosa",
    password: "pepeeselmejor",
    dbUri: "mongodb://localhost:27017/developmentPortfolio",
  },
  "production": {
    port: 8080,
    username: "dmsosa",
    password: "pepeeselmejor",
    dbUri: "mongodb://localhost:27017/developmentPortfolio",
    },
}
export default configObject;