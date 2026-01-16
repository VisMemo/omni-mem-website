const SPECIAL_CHAR_PATTERN = /[!@#$%^&*(),.?":{}|<>]/
const UPPERCASE_PATTERN = /[A-Z]/
const NUMBER_PATTERN = /\d/
const MIN_LENGTH = 9

export function validatePasswordComplexity(password: string): string | null {
  if (!password) return '密码不能为空。'

  const errors: string[] = []
  if (password.length < MIN_LENGTH) {
    errors.push(`长度至少 ${MIN_LENGTH} 位`)
  }
  if (!UPPERCASE_PATTERN.test(password)) {
    errors.push('包含 1 个大写字母')
  }
  if (!NUMBER_PATTERN.test(password)) {
    errors.push('包含 1 个数字')
  }
  if (!SPECIAL_CHAR_PATTERN.test(password)) {
    errors.push('包含 1 个特殊字符')
  }

  if (errors.length === 0) return null
  return `密码需要${errors.join('，')}。`
}
