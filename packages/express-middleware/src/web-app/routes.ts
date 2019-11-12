import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

const routes = [
  {
    path: '/',
    exact: true,
    component: LoginPage
  },
  {
    path: '**',
    component: NotFoundPage
  }
] 

export default routes
