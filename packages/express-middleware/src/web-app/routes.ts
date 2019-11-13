import MainTemplate from './templates/MainTemplate'

import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

const routes = [
  {
    path: '/',
    component: MainTemplate,
    routes: [
      {
        exact: true,
        component: DashboardPage
      },
      {
        path: '/login',
        exact: true,
        component: LoginPage
      }
    ]
  },
  {
    path: '**',
    component: NotFoundPage
  }
] 

export default routes
