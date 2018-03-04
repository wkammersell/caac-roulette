Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        this._myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Loading... Please wait."});
		this._myMask.show();
		
		var filters = [];
		
		filters.push( Ext.create('Rally.data.wsapi.Filter', {
			property : 'Deleted',
			operator: '=',
			value: 'false'
		} ) );
		filters.push( Ext.create('Rally.data.wsapi.Filter', {
			property : 'Disabled',
			operator: '=',
			value: 'false'
		} ) );
		
		// Only show users who have been active in the last 30 days
		var activeDate = new Date();
		activeDate.setDate( activeDate.getDate() - 30 );
		filters.push( Ext.create('Rally.data.wsapi.Filter', {
			property : 'LastActiveDate',
			operator: '>=',
			value: activeDate
		} ) );
		
		var store = Ext.create(
			'Rally.data.wsapi.Store',
			{
				model: 'User',
				fetch: [
					'DefaultProject',
					'DisplayName',
					'EmailAddress',
					'FirstName',
					'Language',
					'LastActiveDate',
					'LastName',
					'MiddleName',
					'OfficeLocation',
					'Phone',
					'Role'
				],
				sorters: [
					{
						property: 'LastActiveDate',
						direction: 'ASC'
					}
				],
				context: this.getContext().getDataContext(),
				pageSize: 200,
				limit: 200
			},
			this
		);
		store.addFilter( filters, false );
		store.loadPage( 1, {
			scope: this,
			callback: function( records, operation ) {
				if( operation.wasSuccessful() ) {
					this._myMask.hide();
					this.displayUser( records );
				} else {
					this._myMask.hide();
					this.clearContent();
					this.addLabel( this, "Error loading users<br/>" );
					this.addLabel( this, operation.error.errors[0] );
				}
			}
		});
    },
    
    displayUser:function( records ) {
    	var randomIndex = Math.floor( Math.random() * records.length );
		var user = ( records[ randomIndex ].data );
    	
    	var fullBox = this.add( {
			xype: 'container',
			border: 0,
			layout: {
				type: 'hbox',
				align: 'stretch'
			}
		});
		
		var detailsBox = fullBox.add( {
			xype: 'container',
			border: 0,
			flex: 1,
			layout: {
				type: 'vbox',
				align: 'stretch'
			}
		});
		
		var color = '#' + ( user.ObjectID % 1000000 ).toString().padStart( 6, '0' );
		
		//TODO: Handle null values
		this.addLabel( detailsBox, user.FirstName + ' ' + user.MiddleName + ' ' + user.LastName );
		this.addLabel( detailsBox, 'aka: ' + user.DisplayName );
		
		this.addHeader( detailsBox, 'Role', color );
		this.addLabel( detailsBox, user.Role );
		
		this.addHeader( detailsBox, 'Office Location', color );
		this.addLabel( detailsBox, user.OfficeLocation );
		
		this.addHeader( detailsBox, 'Email', color );
		this.addLabel( detailsBox, user.EmailAddress );
		
		this.addHeader( detailsBox, 'Phone', color );
		this.addLabel( detailsBox, user.Phone );
		
		this.addHeader( detailsBox, 'Language', color );
		this.addLabel( detailsBox, user.Language );
		
		this.addHeader( detailsBox, 'Default Project', color );
		this.addLabel( detailsBox, user.DefaultProject._refObjectName );
		
		this.addHeader( detailsBox, 'Last Active Date', color );
		this.addLabel( detailsBox, user.LastActiveDate.toLocaleString( 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } ) );
		
		var imageBox = fullBox.add( {
			xype: 'container',
			border: 0,
			flex: 1,
			layout: {
				type: 'vbox'			}
		});
		
		imageBox.add( {
			xtype: 'image',
			//TODO: Make this work in other environments
			src: 'http://rally1.rallydev.com/slm/profile/image/' + user.ObjectID + '/100.sp',
			height: '100px',
			width: '100px'
		} );
    	
    	//TODO: Add respin option
    	//TODO: Add last work items
    },
    
    addHeader:function( parent, text, color ) {
		parent.add( {
			xtype: 'label',
			html: '<u><b>' + text + '</b></u>',
			style: {
				'font-size': '12px',
				'color': color ? color : '#333333'
			},
			padding: '5 0 1 0'
		} );
	},
    
    addLabel:function( parent, text ) {
		parent.add( {
			xtype: 'label',
			html: text,
			style: {
				'font-size': '15px'
			}
		} );
	},
	
	clearContent:function() {
		while( this.down( '*' ) ) {
			this.down( '*' ).destroy();
		}
	}
});
