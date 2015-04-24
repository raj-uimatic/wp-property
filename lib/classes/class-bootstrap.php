<?php
/**
 * Bootstrap
 *
 * @since 2.0.0
 */
namespace UsabilityDynamics\WPP {

  if( !class_exists( 'UsabilityDynamics\WPP\Bootstrap' ) ) {

    final class Bootstrap extends \UsabilityDynamics\WP\Bootstrap_Plugin {
      
      /**
       * Singleton Instance Reference.
       *
       * @protected
       * @static
       * @property $instance
       * @type UsabilityDynamics\WPP\Bootstrap object
       */
      protected static $instance = null;
      
      /**
       * Instantaite class.
       */
      public function init() {
        global $wp_properties;
        
        //** Init Settings */
        $this->settings = new Settings( array(
          'key'  => 'wpp_settings',
          'store'  => 'options',
          'data' => array(
            'name' => $this->name,
            'version' => $this->args[ 'version' ],
            'domain' => $this->domain,
          )
        ));
      
        /** Defaults filters and hooks */
        include_once $this->path( 'lib/default_api.php', 'dir' );
        /** Loads general functions used by WP-Property */
        include_once $this->path( 'lib/class_functions.php', 'dir' );
        /** Loads Admin Tools feature */
        include_once $this->path( 'lib/class_admin_tools.php', 'dir' );
        /** Loads export functionality */
        include_once $this->path( 'lib/class_property_export.php', 'dir' );
        /** Loads all the metaboxes for the property page */
        include_once $this->path( 'lib/ui/class_ui.php', 'dir' );
        /** Loads all the metaboxes for the property page */
        include_once $this->path( 'lib/class_core.php', 'dir' );
        /** Load set of static methods for mail notifications */
        include_once $this->path( 'lib/class_mail.php', 'dir' );
        /** Load in hooks that deal with legacy and backwards-compat issues */
        include_once $this->path( 'lib/class_legacy.php', 'dir' );
        
        //** Initiate the plugin */
        $this->core = new \WPP_Core();

        //** Initiate Meta Box Handler */
        new Meta_Box();
        //** Initiate AJAX Handler */
        //new Ajax();
      }
      
      /**
       * Return localization's list.
       *
       * @author peshkov@UD
       * @return array
       */
      public function get_localization() {
        return apply_filters( 'wpp::get_localization', array(
          'licenses_menu_title' => __( 'Add-ons', $this->domain ),
          'licenses_page_title' => __( 'WP-Property Add-ons Manager', $this->domain ),
        ) );
      }
      
      /**
       * Plugin Activation
       *
       */
      public function activate() {
        global $wp_rewrite;
        //** Do close to nothing because only ran on activation, not updates, as of 3.1 */
        //** Handled by WPP_F::manual_activation(). */
        $wp_rewrite->flush_rules();
      }
      
      /**
       * Plugin Deactivation
       *
       */
      public function deactivate() {
        global $wp_rewrite;
        $wp_rewrite->flush_rules();
      }

    }

  }

}
