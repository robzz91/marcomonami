<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <AdminSidebar />
    
    <!-- Main content -->
    <div class="admin-main">
      <!-- Top navigation -->
      <AdminTopNav />
      
      <!-- Page content -->
      <main class="py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <router-view />
        </div>
      </main>
    </div>
    
    <!-- Notifications -->
    <NotificationContainer />
  </div>
</template>

<script setup>
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import AdminTopNav from '@/components/layout/AdminTopNav.vue'
import NotificationContainer from '@/components/common/NotificationContainer.vue'
</script>