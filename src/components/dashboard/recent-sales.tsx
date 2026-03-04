import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const recentSales = [
  {
    id: '1',
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    avatar: 'https://i.pravatar.cc/150?u=olivia',
    initials: 'OM',
  },
  {
    id: '2',
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    avatar: 'https://i.pravatar.cc/150?u=jackson',
    initials: 'JL',
  },
  {
    id: '3',
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    avatar: 'https://i.pravatar.cc/150?u=isabella',
    initials: 'IN',
  },
  {
    id: '4',
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    avatar: '',
    initials: 'WK',
  },
  {
    id: '5',
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    avatar: 'https://i.pravatar.cc/150?u=sofia',
    initials: 'SD',
  },
];

export function RecentSales() {
  return (
    <div className="space-y-8">
      {recentSales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={sale.avatar} alt={sale.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
              {sale.initials}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium text-sm">{sale.amount}</div>
        </div>
      ))}
    </div>
  );
}
