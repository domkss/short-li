/*Redis constants*/
export enum REDIS_NAME_PATTERNS {
  LINK_PRETAG = "link:",
  USER_PRETAG = "user:",
  STATISTICAL_IP_ADDRESSES = "statistical:ips:",
}

export enum REDIS_LINK_FIELDS {
  TARGET = "target_url",
  REDIRECT_COUNTER = "redirect_counter",
}
export enum REDIS_USER_FIELDS {
  PASSWORD_HASH = "password",
  PASSWORD_SALT = "salt",
}

export enum REDIS_ERRORS {
  REDIS_CLIENT_ERROR = "Internal server Error",
  REDIS_DB_WRITE_ERROR = "Can't save the URL to the database",
  DATA_VALIDATION_ERROR = "Input data validation error",
}

/*Login constants*/
export enum AUTHENTICATION_ERRORS {
  WEEK_PASSWORD_ERROR = "The password is not strong enough",
  USER_ALREADY_EXISTS = "This email address is already registered",
}