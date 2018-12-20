import React from "react";
import PropTypes, { number } from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import NotificationsIcon from "@material-ui/icons/Notifications";
import { mainListItems, secondaryListItems } from "./listItems";
import styles from "./DashboardStyles";
import PoseNet from "./PoseNet";
import SideBar from "./SideBar"
import './css/Dashboard.css'

class Dashboard extends React.Component {
  state = {
    open: false,
    poseCount: 0
  };

  handlePoseChange = (numberOfPoses) => {
      this.setState({poseCount: numberOfPoses})
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="absolute"
          className={classNames(
            classes.appBar,
            this.state.open && classes.appBarShift
          )}
        >
          <Toolbar
            disableGutters={!this.state.open}
            className={classes.toolbar}
          >
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(
                classes.menuButton,
                this.state.open && classes.menuButtonHidden
              )}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              <b>Motion Intelligence</b>
            </Typography>

            <img className="amaris-logo" src="https://static.wixstatic.com/media/636039_47df5f7b2a60402196eac29468b78918~mv2.png/v1/fill/w_240,h_60,al_c,lg_1,q_80/636039_47df5f7b2a60402196eac29468b78918~mv2.webp" alt=""/>


          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: classNames(
              classes.drawerPaper,
              !this.state.open && classes.drawerPaperClose
            )
          }}
          open={this.state.open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>{mainListItems}</List>
          <Divider />
          <List>{secondaryListItems}</List>
        </Drawer>
        
        <main id="main-display-container" className={classes.content}>
          {/* <div className={classes.appBarSpacer} /> */}
          <PoseNet
          handlePoseChange={this.handlePoseChange}
          videoWidth={800}
          videoHeight={667}
          flipHorizontal={true}
          algorithm={"multi-pose"}
          mobileNetArchitecture={0.75}
          showVideo={true}
          showSkeleton={true}
          showPoints={true}
          minPoseConfidence={0.15}
          minPartConfidence={0.1}
          maxPoseDetections={20}
          nmsRadius={20.0}
          outputStride={16}
          imageScaleFactor={0.5}
          skeletonColor={"aqua"}
          skeletonLineWidth={5}
          loadingText={"Motion Intelligence"}
        />
        <SideBar poseCount={this.state.poseCount}/>
        </main>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Dashboard);
