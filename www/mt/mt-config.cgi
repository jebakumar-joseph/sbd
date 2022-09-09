## Movable Type Configuration File
##
## This file defines system-wide
## settings for Movable Type. In 
## total, there are over a hundred 
## options, but only those 
## critical for everyone are listed 
## below.
##
## Information on all others can be 
## found at:
##  https://www.movabletype.jp/documentation/config
## StaticFilePath /usr/home/ai123hdijh/html/mt/mt-static
#======== REQUIRED SETTINGS ==========

CGIPath        /mt/
StaticWebPath  /mt/mt-static/
StaticFilePath C:\htdocs\sbd\www\mt\mt-static

#======== DATABASE SETTINGS ==========

ObjectDriver DBI::mysql
Database sbd_db
DBUser root
## DBPassword cmsadmin1100
DBHost localhost

#======== MAIL =======================

    
DefaultLanguage ja


AdminScript pewweim93y6e.cgi
