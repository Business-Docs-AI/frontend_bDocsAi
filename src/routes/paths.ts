/**
 * Caminhos de rota centralizados. Componentes e a navegação devem referenciar
 * estas constantes em vez de strings soltas, evitando links quebrados.
 */
export const paths = {
  login: '/login',
  chat: '/chat',
  documentation: '/documentation',
  categories: '/categories',
  users: '/users',
} as const;
