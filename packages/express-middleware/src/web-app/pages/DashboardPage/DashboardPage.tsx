import * as React from 'react'
import axios, { AxiosResponse} from 'axios'\
import * as flat from 'flat'
// import { Link } from 'react-router-dom'
// import Button from '@material-ui/core/Button'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Switch from '@material-ui/core/Switch'
import Container from '@material-ui/core/Container'


interface DashboardPageState {
  flags: any
}

class DashboardPage extends React.PureComponent<{}, DashboardPageState> {
  constructor(props: any) {
    super(props)

    this.state = {
      flags: []
    }
  }
  
  public async componentWillMount(): Promise<void> {
    const linksResponse: AxiosResponse = await this.getData()

    this.buildGroupsSwitches(linksResponse.data)
    
    this.setState({
      flags: linksResponse.data
    })
  }

  private buildGroupsSwitches(switches: any[]) {
    // const unflatened = flat.unflatten(switches)
    console.log(switches)
    // switches.forEach((flag: any) => {
    //   const switchParts = flag.key.split('.')
    //   console.log(switchParts)
    // })
  }

  private async getData() {
    return axios.get('/basket/switches/list')
  }

  private async updateSwitch(key: string, enabled: boolean) {
    const updatedSwitch = {
      key,
      project: 'basket',
      environment: 'local',
      enabled: !enabled
    }

    await axios.post('/basket/switches/update', updatedSwitch)
    const flags = await this.getData()

    this.setState({
      flags: flags.data
    })
  }

  private handleSwitchChange(key: string, enabled: boolean) {
    return async (event: any) => {
      await this.updateSwitch(key, enabled)
      await this.getData()
    }
  }

  private renderSwitches(): JSX.Element {
    return this.state.flags.map((flagValue: any) => {
      return (
        <TableRow>
          <TableCell>{flagValue.key}</TableCell>
          <TableCell align="right">
            <Switch
              checked={flagValue.enabled}
              onChange={this.handleSwitchChange(flagValue.key, flagValue.enabled)}
              value={flagValue.key}
              color='primary'
              inputProps={{ 'aria-label': 'secondary checkbox' }}
            />
          </TableCell>
        </TableRow>
      )
    })
  }
 
  public render(): JSX.Element {
    return (
      <Container>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Switch Name</TableCell>
                <TableCell align="right">Enabled</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderSwitches()}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    )
  }
}

export default DashboardPage
