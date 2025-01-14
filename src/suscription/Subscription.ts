export class Subscription {
    id: string; // UUID o algún identificador único
    plan: string; // Nombre o tipo de plan, por ejemplo, 'Monthly', 'Annual'
    amount: number; // Monto de la suscripción
    startDate: Date; // Fecha de inicio de la suscripción
    endDate: Date; // Fecha de fin de la suscripción
    status: string; // Estado de la suscripción, por ejemplo, 'active', 'canceled'
  
    // Opcional: Propiedad para relacionar la suscripción con un usuario
    // userId?: string; // ID del usuario (para usar en el futuro)
  }