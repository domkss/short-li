/*Redis constants*/
export enum REDIS_NAME_PATTERNS {
  LINK_PRETAG = "link:",
  USER_PRETAG = "user:",
  USER_LINKS = "user:links:",
  STATISTIC_COUNTRY_CODE = "statistic:countries:",
}

export enum REDIS_LINK_FIELDS {
  TARGET = "target_url",
  REDIRECT_COUNTER = "redirect_counter",
  TRACKED = "tracked",
  NAME = "name",
}
export enum REDIS_USER_FIELDS {
  PASSWORD_HASH = "password",
  PASSWORD_SALT = "salt",
  RESTRICTED = "restricted",
  INVALID_LOGIN_COUNTER = "invalid_login_counter",
  LOGIN_BLOCK_OUT_TIME = "login_block_time",
  RECOVERY_TOKEN = "recovery_token",
  RECOVERY_TOKEN_EXPIRY_TIME = "recovery_token_expiry_date",
  INVALID_RECOVERY_TOKEN_COUNTER = "invalid_recovery_counter",
}

export enum REDIS_ERRORS {
  REDIS_CLIENT_ERROR = "Internal server Error",
  REDIS_DB_WRITE_ERROR = "Can't save the URL to the database",
  DATA_VALIDATION_ERROR = "Input data validation error",
  ACCESS_DENIED_ERROR = "Access dennied",
}

/*Login constants*/
export enum AUTHENTICATION_ERRORS {
  USER_ALREADY_EXISTS = "This email address is already registered",
  RECAPCHA_VALIDATION_FAILED = "ReCaptcha validation failed",
}

export enum LoginUserResult {
  Success,
  Failed,
  Blocked,
  Restricted,
}

export enum RECAPTCHA_ACTIONS {
  REGISTER_FORM_SUBMIT = "registerFormSubmit",
  PW_RECOVERY_TOKEN_REQUEST = "passwordRecoveryTokenRequest",
}
