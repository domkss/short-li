export enum REDIS_NAME_PATTERNS {
  WEB_LINK_PRETAG = "link:",
}

export enum REDIS_ERRORS {
  REDIS_CLIENT_ERROR = "Internal server Error",
  REDIS_DB_WRITE_ERROR = "Can't save the URL to the database",
  DATA_VALIDATION_ERROR = "Input data validation error",
}
