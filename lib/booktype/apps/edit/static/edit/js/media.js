/*
  This file is part of Booktype.
  Copyright (c) 2013 Aleksandar Erkalovic <aleksandar.erkalovic@sourcefabric.org>
 
  Booktype is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
 
  Booktype is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.
 
  You should have received a copy of the GNU Affero General Public License
  along with Booktype.  If not, see <http://www.gnu.org/licenses/>.
*/

(function(win, jquery) {

	jquery.namespace('win.booktype.editor.media');

  win.booktype.editor.media = function() {
    var attachments;
    var templ = '<tr>\
                  <td>\
                    <input type="checkbox" name="attachment" value="<%= id %>">\
                  </td>\
                  <td><a href="<%= link %>" target="_new"><%= name %></a></td>\
                  <td><%= dimension %></td>\
                  <td class="size"><%= size %></td>\
                  <td><%= date %></td>\
                </tr>';

    var drawAttachments = function() {
      var s = '';

      jquery.each(attachments, function(i, item) {
          var t = _.template(templ);
          var a = t({'name': item.name,
                     'id': item.id, 
                     'link': 'static/'+item.name,
                     'size': win.booktype.utils.formatSize(item.size),
                     'dimension': item.dimension[0]+'x'+item.dimension[1],
                     'date': item.created });
          s += a;
      });

      jquery("#content table tbody").html(s);
    }

    var loadAttachments = function() {
      win.booktype.ui.notify('Loading media files');

      win.booktype.sendToCurrentBook({"command": "attachments_list"}, 
                                      function(data) {
                                          win.booktype.ui.notify();
                                          attachments = data.attachments;

                                          drawAttachments();
                                          window.scrollTo(0, 0);
                                      });
    }

    var _show = function() {
      jquery("DIV.contentHeader").html('<h2>Media</h2>');

      var t = win.booktype.ui.getTemplate('templateMediaContent');
      jquery("#content").html(t);

      loadAttachments();

      jquery("#content #delete-selected-items").on('click', function() {      
        var lst = win._.map(jquery("#content table INPUT[type=checkbox]:checked"), function(elem) { return jquery(elem).val() }).join(',');

        jquery('#removeMedia').modal('show');
        jquery('#removeMedia INPUT[name=attachments]').val(lst);                                 
      });      


      // Remove Media
      jquery("#removeMedia").on('show', function() {
         jquery("#removeMedia .btn-primary").prop('disabled', true); 
         jquery("#removeMedia INPUT[name=understand]").prop('checked', false);
      });

      jquery("#removeMedia .close-button").on('click', function() {
        jquery("#removeMedia").modal('hide');
      })

      jquery("#removeMedia INPUT[name=understand]").on('change', function() {
         var $this = jquery(this);

         jquery("#removeMedia .btn-primary").prop('disabled', !$this.is(':checked'));
      });

      jquery("#removeMedia .btn-primary").on('click', function() {
        if(jquery("#removeMedia INPUT[name=understand]:checked").val() == 'on') {
            var lst = jquery("#removeMedia INPUT[name=attachments]").attr("value").split(",");

            win.booktype.ui.notify('Removing media files');

            win.booktype.sendToCurrentBook({"command": "attachments_delete",
                                            "attachments": lst},
                                            function(data) {
                                                win.booktype.ui.notify();
                                                loadAttachments();
                                                jquery("#removeMedia").modal('hide');        
                                            });
          }

        });

    }

    var _hide = function() {
                  jquery('#content').empty();
                  jquery("DIV.contentHeader").empty();
                }

    var _init = function() {
                  jquery("#button-media").on('click', function(e) { win.booktype.editor.showMedia(); });
                }


    return {'init': _init,
            'show': _show,
            'hide': _hide,
            'name': 'media'};

  }();

  
})(window, jQuery);