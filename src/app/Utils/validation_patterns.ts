export const validation_patterns = {
  contact_number:/^3[0-9]{9}$/,
  email_regex:/^[a-zA-Z0-9._]+@[a-zA-Z0-9]+(\.[a-zA-Z]{2,4}){1,2}$/,
  covid_regex:/^[a-zA-Z0-9._]+@(moi|moph|motc).gov.qa$/,
  cnic_regex:/^[0-9]{13}$/,
  greaterthan0:/^[1-9][0-9]*$/,
  postive_numbers:/^[0-9]*$/,
  alphanumeric:/^[0-9a-zA-Z]*$/,
  alphabets:/^[a-zA-Z]*$/,
  password_regex:/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*`'#?&./-])[A-Za-z\d$@$!%`'*#?&./-]{8,}$/,
  branch_contact_number:/^[0-9]{10,11}$/,
  decimal_numbers:/^\d*\.?\d*$/,
  nameRegex:/^[a-zA-Z`'/-\s]*$/,
  phone_numbers:/^[\+\-0-9]*$/,
  date_pattern:/^[1-9][0-9][0-9][0-9]\-[0-9]{2}\-[0-9]{2}$/
}
