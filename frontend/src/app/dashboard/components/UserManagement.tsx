'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastActive: string;
  avatar: string;
  alt: string;
}

interface UserManagementProps {
  users: User[];
}

const UserManagement = ({ users }: UserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-card rounded-lg p-6 elevation-subtle">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold font-orbitron text-foreground">User Management</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-foreground font-jetbrains text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-muted rounded-lg text-foreground font-rajdhani font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Analyst">Analyst</option>
            <option value="Reviewer">Reviewer</option>
          </select>
        </div>
      </div>
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 spring-animation">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <AppImage
                  src={user.avatar}
                  alt={user.alt}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${user.status === 'active' ? 'bg-success' : 'bg-muted-foreground'}`} />
              </div>
              <div>
                <h3 className="font-rajdhani font-semibold text-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground font-jetbrains">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-rajdhani font-semibold text-foreground">{user.role}</p>
                <p className="text-xs text-muted-foreground font-jetbrains">Last active: {user.lastActive}</p>
              </div>
              <button className="p-2 hover:bg-background rounded-lg spring-animation">
                <Icon name="EllipsisVerticalIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;