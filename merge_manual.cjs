const fs = require('fs');
const base = fs.readFileSync('F:/connect-main/ctx_base.tsx', 'utf8');
let res = base;
// Add api import
res = res.replace("import { StickerItem, INITIAL_STICKERS } from '../data/stickersData';",
  "import { StickerItem, INITIAL_STICKERS } from '../data/stickersData';\nimport { apiService } from '../services/api.ts';");
// Update interface
res = res.replace("  login: (asUser?: 'alex' | 'jordan') => void;\n  logout: () => void;",
  "  login: (emailOrUser: string | 'alex' | 'jordan', password?: string) => Promise<void>;\n  signup: (email: string, password: string, name: string) => Promise<void>;\n  logout: () => void;");
// Update implementation
const oldLogin = "  const login = (asUser: 'alex' | 'jordan' = 'alex') => {\n    setCurrentUserIdState(asUser);\n    setIsAuthenticated(true);\n    if (soundEnabled) playSoundEffect('settle');\n  };\n\n  const logout = () => {\n    setIsAuthenticated(false);\n  };";
const newLogin = "  const login = async (emailOrUser: string | 'alex' | 'jordan' = 'alex', password?: string, name?: string) => {\n    try {\n      if (typeof emailOrUser === 'string' && emailOrUser.includes('@')) {\n        if (password) {\n          if (name) {\n            await apiService.register(emailOrUser, password, name);\n          } else {\n            await apiService.login(emailOrUser, password);\n          }\n          setIsAuthenticated(true);\n          if (soundEnabled) playSoundEffect('settle');\n          return;\n        }\n      }\n      const asUser = (emailOrUser as 'alex' | 'jordan') || 'alex';\n      setCurrentUserIdState(asUser);\n      setIsAuthenticated(true);\n      if (soundEnabled) playSoundEffect('settle');\n      return;\n    } catch (error) {\n      throw error;\n    }\n  };\n\n  const signup = async (email: string, password: string, name: string) => {\n    await apiService.register(email, password, name);\n    setIsAuthenticated(true);\n    if (soundEnabled) playSoundEffect('settle');\n  };\n\n  const logout = () => {\n    apiService.logout();\n    setIsAuthenticated(false);\n  };";
if (res.includes(oldLogin)) {
  res = res.replace(oldLogin, newLogin);
} else {
  // Try alternative pattern
  res = res.replace("  const login = (asUser: 'alex' | 'jordan' = 'alex') => {", 
    "  const login = async (emailOrUser: string | 'alex' | 'jordan' = 'alex', password?: string, name?: string) => {");
}
// Add signup to context value
res = res.replace("    isAuthenticated,\n    login,\n    logout,", "    isAuthenticated,\n    login,\n    signup,\n    logout,");
fs.writeFileSync('F:/connect-main/src/context/ConnectContext.tsx', res);
console.log('done');
