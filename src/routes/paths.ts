/**
 * Caminhos de rota centralizados. Componentes e a navegação devem referenciar
 * estas constantes em vez de strings soltas, evitando links quebrados.
 */
export const paths = {
  chat: '/chat',
  documentation: '/documentation',
  categories: '/categories',
  integrations: '/integrations',
  users: '/users',
} as const;
